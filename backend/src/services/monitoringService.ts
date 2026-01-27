import { prisma } from '../index';
import * as auditLogService from './auditLogService';

const MAILBOX_BOUNCE_THRESHOLD = 5; // Configurable
const MAILBOX_WINDOW_SIZE = 100;    // Configurable
const DOMAIN_WARNING_THRESHOLD = 2; // Configurable: Number of non-healthy mailboxes to trigger domain warning

/**
 * Record a 'Sent' event to track the window.
 * Resets window if we've passed the window size without issues.
 */
export const recordSent = async (mailboxId: string, campaignId: string) => {
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (!mailbox) return;

    let newSentCount = mailbox.window_sent_count + 1;
    let shouldReset = false;

    // Window Reset Logic: If we hit window size and status is active (healthy), reset counters
    // This allows "healing" over time.
    if (newSentCount > MAILBOX_WINDOW_SIZE && mailbox.status === 'active') {
        newSentCount = 0;
        shouldReset = true;
    }

    const updateData: any = { window_sent_count: newSentCount };
    if (shouldReset) {
        updateData.window_bounce_count = 0;
        updateData.window_start_at = new Date();
    }

    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: updateData,
    });

    // Log primarily for debug/trace, but maybe too noisy for prod. Keeping for MVP.
    if (shouldReset) {
        await auditLogService.logAction('mailbox', mailboxId, 'monitor_window', 'reset', `Window reset after ${MAILBOX_WINDOW_SIZE} safe sends`);
    }
};

/**
 * Record a 'Bounce' event.
 * Triggers Pause logic if threshold exceeded.
 */
export const recordBounce = async (mailboxId: string, campaignId: string) => {
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (!mailbox) return;

    const newBounceCount = mailbox.window_bounce_count + 1;
    const totalBounces = mailbox.hard_bounce_count + 1;

    // Update Stats
    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: {
            window_bounce_count: newBounceCount,
            hard_bounce_count: totalBounces,
        },
    });

    await auditLogService.logAction('mailbox', mailboxId, 'monitor_bounce', 'stat_update', `Window Bounces: ${newBounceCount}/${mailbox.window_sent_count}`);

    // Check Threshold
    if (newBounceCount >= MAILBOX_BOUNCE_THRESHOLD) {
        if (mailbox.status !== 'paused') {
            await pauseMailbox(mailboxId, `Exceeded ${MAILBOX_BOUNCE_THRESHOLD} bounces in current window`);
        }
    }
};

/**
 * Pauses a mailbox and triggers Domain Health Check.
 */
const pauseMailbox = async (mailboxId: string, reason: string) => {
    await prisma.mailbox.update({
        where: { id: mailboxId },
        data: { status: 'paused' },
    });

    await auditLogService.logAction('mailbox', mailboxId, 'monitor_threshold', 'pause', reason);

    // Trigger Domain Check logic
    const mailbox = await prisma.mailbox.findUnique({ where: { id: mailboxId } });
    if (mailbox) {
        await checkDomainHealth(mailbox.domain_id);
    }
};

/**
 * Aggregates mailbox health to determine Domain status.
 */
const checkDomainHealth = async (domainId: string) => {
    const domain = await prisma.domain.findUnique({
        where: { id: domainId },
        include: { mailboxes: true },
    });
    if (!domain) return;

    const unhealthyMailboxes = domain.mailboxes.filter(m => m.status !== 'active' && m.status !== 'warming'); // assuming active/warming are good
    const unhealthyCount = unhealthyMailboxes.length;

    console.log(`[MONITOR] Domain ${domain.domain} has ${unhealthyCount} unhealthy mailboxes.`);

    if (unhealthyCount >= DOMAIN_WARNING_THRESHOLD) {
        if (domain.status !== 'paused') { // We can escalate to PAUSED or WARNING. For MVP let's go straight to PAUSE/WARNING logic.
            // Requirement: "Warning -> Paused". Let's set to WARNING first, or if already WARNING, set to PAUSED?
            // Simplified Logic: >= Threshold -> PAUSED for safety.

            await prisma.domain.update({
                where: { id: domainId },
                data: { status: 'paused', paused_reason: 'Multiple mailboxes degraded', warning_count: { increment: 1 } },
            });
            await auditLogService.logAction('domain', domainId, 'monitor_aggregation', 'pause', `Paused: ${unhealthyCount} mailboxes unhealthy`);

            // Should we pause all other mailboxes? Logic says yes.
            // "Escalation: pause domain (via campaign/mailbox aggregation)"
            // "Actions: Pause all associated campaigns/mailboxes"
            await prisma.mailbox.updateMany({
                where: { domain_id: domainId, status: 'active' },
                data: { status: 'paused' },
            });
            await auditLogService.logAction('domain', domainId, 'monitor_cascade', 'pause_all', 'Cascaded pause to all mailboxes');
        }
    }
};
