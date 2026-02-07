/**
 * Monitoring Service
 * 
 * Tracks mailbox and domain health through event monitoring.
 * Section 7 of Audit: Monitoring Engine Design.
 * Section 8 of Audit: State Machine Architecture.
 * Section 11 of Audit: Recovery & Cooldown Modeling.
 * 
 * Key features:
 * - Window-based metrics (1h, 24h, 7d)
 * - Threshold-based pause escalation
 * - Cooldown enforcement for recovery
 * - Domain aggregation from mailbox health
 */

import { prisma } from '../index';
import * as auditLogService from './auditLogService';
import * as eventService from './eventService';
import {
    EventType,
    MailboxState,
    DomainState,
    MONITORING_THRESHOLDS,
    STATE_TRANSITIONS
} from '../types';

const {
    MAILBOX_BOUNCE_THRESHOLD,
    MAILBOX_WINDOW_SIZE,
    DOMAIN_WARNING_THRESHOLD,
    COOLDOWN_MINIMUM_MS,
    COOLDOWN_MULTIPLIER
} = MONITORING_THRESHOLDS;

/**
 * Get organization ID from a mailbox.
 */
async function getMailboxOrgId(mailboxId: string): Promise<string | null> {
    const mailbox = await prisma.mailbox.findUnique({
        where: { id: mailboxId },
        select: { organization_id: true }
    });
    return mailbox?.organization_id || null;
}

/**
 * Record a bounce event for a mailbox.
 * May trigger mailbox pause if threshold exceeded.
 */
export const recordBounce = async (mailboxId: string, campaignId: string): Promise<void> => {
    const mailbox = await prisma.mailbox.findUnique({
        where: { id: mailboxId },
        include: { domain: true }
    });
    if (!mailbox) return;

    const orgId = mailbox.organization_id;

    // Store raw event
    await eventService.storeEvent({
        organizationId: orgId,
        eventType: EventType.HARD_BOUNCE,
        entityType: 'mailbox',
        entityId: mailboxId,
        payload: { mailboxId, campaignId }
    });

    const newBounceCount = mailbox.window_bounce_count + 1;
    const totalBounces = mailbox.hard_bounce_count + 1;

    // Update Stats
    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: {
            window_bounce_count: newBounceCount,
            hard_bounce_count: totalBounces,
            last_activity_at: new Date()
        }
    });

    await auditLogService.logAction({
        organizationId: orgId,
        entity: 'mailbox',
        entityId: mailboxId,
        trigger: 'monitor_bounce',
        action: 'stat_update',
        details: `Window Bounces: ${newBounceCount}/${mailbox.window_sent_count}`
    });

    // Check Threshold
    if (newBounceCount >= MAILBOX_BOUNCE_THRESHOLD) {
        if (mailbox.status !== 'paused') {
            await pauseMailbox(mailboxId, `Exceeded ${MAILBOX_BOUNCE_THRESHOLD} bounces in current window`);
        }
    }
};

/**
 * Record a sent email event for a mailbox.
 * May trigger window reset if threshold reached.
 */
export const recordSent = async (mailboxId: string, campaignId: string): Promise<void> => {
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (!mailbox) return;

    const orgId = mailbox.organization_id;

    // Store raw event
    await eventService.storeEvent({
        organizationId: orgId,
        eventType: EventType.EMAIL_SENT,
        entityType: 'mailbox',
        entityId: mailboxId,
        payload: { mailboxId, campaignId }
    });

    const newSentCount = mailbox.window_sent_count + 1;
    const totalSent = mailbox.total_sent_count + 1;

    // Update stats
    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: {
            window_sent_count: newSentCount,
            total_sent_count: totalSent,
            last_activity_at: new Date()
        }
    });

    // Check for window reset (healing logic)
    if (newSentCount >= MAILBOX_WINDOW_SIZE) {
        await resetWindow(mailboxId);
    }
};

/**
 * Reset monitoring window for a mailbox.
 * This is the healing mechanism - after N safe sends, we reset counters.
 */
const resetWindow = async (mailboxId: string): Promise<void> => {
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (!mailbox) return;

    const orgId = mailbox.organization_id;

    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: {
            window_sent_count: 0,
            window_bounce_count: 0,
            window_start_at: new Date()
        }
    });

    await auditLogService.logAction({
        organizationId: orgId,
        entity: 'mailbox',
        entityId: mailboxId,
        trigger: 'monitor_window',
        action: 'window_reset',
        details: `Window reset after ${MAILBOX_WINDOW_SIZE} sends. System healing.`
    });

    // If recovering, transition to healthy
    if (mailbox.status === 'recovering' && mailbox.window_bounce_count === 0) {
        await transitionMailboxState(mailboxId, 'recovering', 'healthy', 'Clean window completed');
    }
};

/**
 * Pause a mailbox due to threshold breach.
 * Implements cooldown calculation based on consecutive pauses.
 */
const pauseMailbox = async (mailboxId: string, reason: string): Promise<void> => {
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (!mailbox) return;

    const orgId = mailbox.organization_id;
    const consecutivePauses = mailbox.consecutive_pauses + 1;

    // Calculate cooldown with exponential backoff
    const cooldownMs = COOLDOWN_MINIMUM_MS * Math.pow(COOLDOWN_MULTIPLIER, Math.min(consecutivePauses - 1, 5));
    const cooldownUntil = new Date(Date.now() + cooldownMs);

    // Store event
    await eventService.storeEvent({
        organizationId: orgId,
        eventType: EventType.MAILBOX_PAUSED,
        entityType: 'mailbox',
        entityId: mailboxId,
        payload: { reason, cooldownUntil, consecutivePauses }
    });

    // Update mailbox
    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: {
            status: 'paused',
            last_pause_at: new Date(),
            cooldown_until: cooldownUntil,
            consecutive_pauses: consecutivePauses
        }
    });

    // Record state transition
    await prisma.stateTransition.create({
        data: {
            organization_id: orgId,
            entity_type: 'mailbox',
            entity_id: mailboxId,
            from_state: mailbox.status,
            to_state: 'paused',
            reason,
            triggered_by: 'threshold_breach'
        }
    });

    await auditLogService.logAction({
        organizationId: orgId,
        entity: 'mailbox',
        entityId: mailboxId,
        trigger: 'monitor_threshold',
        action: 'pause',
        details: `${reason}. Cooldown until ${cooldownUntil.toISOString()}`
    });

    // Trigger Domain Check
    await checkDomainHealth(mailbox.domain_id);
};

/**
 * Transition mailbox state with validation.
 */
const transitionMailboxState = async (
    mailboxId: string,
    fromState: string,
    toState: string,
    reason: string
): Promise<boolean> => {
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (!mailbox) return false;

    const orgId = mailbox.organization_id;

    // Validate transition
    const fromStateKey = fromState as keyof typeof STATE_TRANSITIONS.mailbox;
    const validTransitions = STATE_TRANSITIONS.mailbox[fromStateKey] as readonly string[];
    if (!validTransitions || !validTransitions.includes(toState)) {
        console.log(`[MONITOR] Invalid transition: ${fromState} -> ${toState}`);
        return false;
    }

    // Update state
    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: {
            status: toState,
            // Reset consecutive pauses if transitioning to healthy
            ...(toState === 'healthy' && { consecutive_pauses: 0 })
        }
    });

    // Record transition
    await prisma.stateTransition.create({
        data: {
            organization_id: orgId,
            entity_type: 'mailbox',
            entity_id: mailboxId,
            from_state: fromState,
            to_state: toState,
            reason,
            triggered_by: 'system'
        }
    });

    await auditLogService.logAction({
        organizationId: orgId,
        entity: 'mailbox',
        entityId: mailboxId,
        trigger: 'state_machine',
        action: 'state_transition',
        details: `${fromState} -> ${toState}: ${reason}`
    });

    return true;
};

/**
 * Check domain health based on mailbox aggregation.
 * Section 8.2: Domain escalation requires sustained degradation.
 */
const checkDomainHealth = async (domainId: string): Promise<void> => {
    const domain = await prisma.domain.findUnique({
        where: { id: domainId },
        include: { mailboxes: true }
    });
    if (!domain) return;

    const orgId = domain.organization_id;

    // Count unhealthy mailboxes
    const unhealthyMailboxes = domain.mailboxes.filter(
        m => m.status !== 'active' && m.status !== 'healthy' && m.status !== 'warming'
    );
    const unhealthyCount = unhealthyMailboxes.length;

    console.log(`[MONITOR] Domain ${domain.domain} has ${unhealthyCount} unhealthy mailboxes.`);

    if (unhealthyCount >= DOMAIN_WARNING_THRESHOLD) {
        if (domain.status !== 'paused') {
            // Pause domain
            const consecutivePauses = domain.consecutive_pauses + 1;
            const cooldownMs = COOLDOWN_MINIMUM_MS * Math.pow(COOLDOWN_MULTIPLIER, Math.min(consecutivePauses - 1, 5));
            const cooldownUntil = new Date(Date.now() + cooldownMs);

            await eventService.storeEvent({
                organizationId: orgId,
                eventType: EventType.DOMAIN_PAUSED,
                entityType: 'domain',
                entityId: domainId,
                payload: { unhealthyCount, reason: 'Multiple mailboxes degraded' }
            });

            await prisma.domain.update({
                where: { id: domainId },
                data: {
                    status: 'paused',
                    paused_reason: 'Multiple mailboxes degraded',
                    warning_count: { increment: 1 },
                    last_pause_at: new Date(),
                    cooldown_until: cooldownUntil,
                    consecutive_pauses: consecutivePauses
                }
            });

            await prisma.stateTransition.create({
                data: {
                    organization_id: orgId,
                    entity_type: 'domain',
                    entity_id: domainId,
                    from_state: domain.status,
                    to_state: 'paused',
                    reason: `${unhealthyCount} mailboxes unhealthy`,
                    triggered_by: 'threshold_breach'
                }
            });

            await auditLogService.logAction({
                organizationId: orgId,
                entity: 'domain',
                entityId: domainId,
                trigger: 'monitor_aggregation',
                action: 'pause',
                details: `Paused: ${unhealthyCount} mailboxes unhealthy`
            });

            // Cascade pause to remaining active mailboxes
            await prisma.mailbox.updateMany({
                where: { domain_id: domainId, status: 'active' },
                data: { status: 'paused' }
            });

            await auditLogService.logAction({
                organizationId: orgId,
                entity: 'domain',
                entityId: domainId,
                trigger: 'monitor_cascade',
                action: 'pause_all',
                details: 'Cascaded pause to all mailboxes'
            });
        }
    }
};
