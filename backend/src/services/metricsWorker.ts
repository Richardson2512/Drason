/**
 * Metrics Worker
 * 
 * Background worker for async processing of metrics and risk calculations.
 * Implements Section 7 of the Infrastructure Audit.
 * 
 * Key features:
 * - Periodic risk recalculation for all active mailboxes
 * - Automatic state transitions based on risk thresholds
 * - Domain-level aggregation
 * - Recovery checks for paused entities
 */

import { prisma } from '../index';
import * as metricsService from './metricsService';
import * as stateTransitionService from './stateTransitionService';
import {
    MailboxState,
    DomainState,
    EntityType,
    TriggerType,
    MONITORING_THRESHOLDS
} from '../types';

// ============================================================================
// WORKER STATE
// ============================================================================

let isRunning = false;
let workerInterval: NodeJS.Timeout | null = null;

// Worker configuration
const WORKER_CONFIG = {
    intervalMs: 60000,          // Run every 60 seconds
    batchSize: 50,              // Process 50 mailboxes per batch
    recoveryCheckIntervalMs: 300000  // Check recovery every 5 minutes
};

// ============================================================================
// WORKER CONTROL
// ============================================================================

/**
 * Start the metrics worker.
 */
export function startWorker(): void {
    if (isRunning) {
        console.log('[WORKER] Metrics worker already running');
        return;
    }

    isRunning = true;
    console.log('[WORKER] Starting metrics worker...');

    // Run immediately, then on interval
    runWorkerCycle();
    workerInterval = setInterval(runWorkerCycle, WORKER_CONFIG.intervalMs);
}

/**
 * Stop the metrics worker.
 */
export function stopWorker(): void {
    if (!isRunning) {
        console.log('[WORKER] Metrics worker not running');
        return;
    }

    isRunning = false;
    if (workerInterval) {
        clearInterval(workerInterval);
        workerInterval = null;
    }
    console.log('[WORKER] Metrics worker stopped');
}

/**
 * Check if worker is running.
 */
export function isWorkerRunning(): boolean {
    return isRunning;
}

// ============================================================================
// WORKER CYCLE
// ============================================================================

/**
 * Main worker cycle - processes all organizations.
 */
async function runWorkerCycle(): Promise<void> {
    const startTime = Date.now();
    console.log('[WORKER] Starting metrics cycle...');

    try {
        // Get all organizations
        const organizations = await prisma.organization.findMany({
            select: { id: true, name: true, system_mode: true }
        });

        for (const org of organizations) {
            await processOrganization(org.id, org.system_mode);
        }

        const duration = Date.now() - startTime;
        console.log(`[WORKER] Metrics cycle completed in ${duration}ms`);
    } catch (error) {
        console.error('[WORKER] Error in metrics cycle:', error);
    }
}

/**
 * Process all mailboxes for an organization.
 */
async function processOrganization(
    organizationId: string,
    systemMode: string
): Promise<void> {
    // Get active mailboxes (not paused)
    const mailboxes = await prisma.mailbox.findMany({
        where: {
            organization_id: organizationId,
            status: { in: [MailboxState.HEALTHY, MailboxState.WARNING, MailboxState.RECOVERING] }
        },
        select: { id: true, status: true, domain_id: true },
        take: WORKER_CONFIG.batchSize
    });

    console.log(`[WORKER] Processing ${mailboxes.length} mailboxes for org ${organizationId}`);

    // Process each mailbox
    for (const mailbox of mailboxes) {
        try {
            await processMailbox(organizationId, mailbox, systemMode);
        } catch (error) {
            console.error(`[WORKER] Error processing mailbox ${mailbox.id}:`, error);
        }
    }

    // Check paused entities for recovery
    await checkRecoveryEligibility(organizationId, systemMode);

    // Aggregate domain-level metrics
    const domains = [...new Set(mailboxes.map(m => m.domain_id))];
    for (const domainId of domains) {
        await updateDomainHealth(organizationId, domainId, systemMode);
    }
}

/**
 * Process a single mailbox - recalculate risk and potentially transition state.
 */
async function processMailbox(
    organizationId: string,
    mailbox: { id: string; status: string; domain_id: string },
    systemMode: string
): Promise<void> {
    // Get current risk assessment
    const risk = await metricsService.calculateAndUpdateRisk(mailbox.id);

    // Determine if state transition is needed
    const currentState = mailbox.status as MailboxState;
    let targetState: MailboxState | null = null;
    let reason = '';

    if (currentState === MailboxState.HEALTHY) {
        if (risk.riskScore >= MONITORING_THRESHOLDS.RISK_SCORE_CRITICAL) {
            targetState = MailboxState.PAUSED;
            reason = `Risk score ${risk.riskScore} exceeded critical threshold`;
        } else if (risk.riskScore >= MONITORING_THRESHOLDS.RISK_SCORE_WARNING) {
            targetState = MailboxState.WARNING;
            reason = `Risk score ${risk.riskScore} exceeded warning threshold`;
        }
    } else if (currentState === MailboxState.WARNING) {
        if (risk.riskScore >= MONITORING_THRESHOLDS.RISK_SCORE_CRITICAL) {
            targetState = MailboxState.PAUSED;
            reason = `Risk score ${risk.riskScore} exceeded critical threshold`;
        } else if (risk.riskScore < MONITORING_THRESHOLDS.RISK_SCORE_WARNING) {
            targetState = MailboxState.HEALTHY;
            reason = `Risk score ${risk.riskScore} dropped below warning threshold`;
        }
    } else if (currentState === MailboxState.RECOVERING) {
        if (risk.riskScore < MONITORING_THRESHOLDS.RISK_SCORE_WARNING) {
            targetState = MailboxState.HEALTHY;
            reason = 'Recovery successful - risk score normalized';
        } else if (risk.riskScore >= MONITORING_THRESHOLDS.RISK_SCORE_CRITICAL) {
            targetState = MailboxState.WARNING;
            reason = 'Recovery incomplete - elevated risk detected';
        }
    }

    // Execute state transition if needed
    if (targetState && targetState !== currentState) {
        // In OBSERVE mode, only log; in ENFORCE mode, execute
        if (systemMode === 'enforce') {
            await stateTransitionService.transitionMailbox(
                organizationId,
                mailbox.id,
                targetState,
                reason,
                TriggerType.SYSTEM
            );
        } else {
            console.log(`[WORKER] Would transition mailbox ${mailbox.id} from ${currentState} to ${targetState} (mode: ${systemMode})`);
        }
    }
}

// ============================================================================
// RECOVERY CHECKS
// ============================================================================

/**
 * Check paused entities for recovery eligibility.
 */
async function checkRecoveryEligibility(
    organizationId: string,
    systemMode: string
): Promise<void> {
    const now = new Date();

    // Find paused mailboxes with expired cooldowns
    const eligibleMailboxes = await prisma.mailbox.findMany({
        where: {
            organization_id: organizationId,
            status: MailboxState.PAUSED,
            cooldown_until: { lte: now }
        },
        select: { id: true }
    });

    for (const mailbox of eligibleMailboxes) {
        if (systemMode === 'enforce') {
            await stateTransitionService.transitionMailbox(
                organizationId,
                mailbox.id,
                MailboxState.RECOVERING,
                'Cooldown period expired - entering recovery',
                TriggerType.COOLDOWN_COMPLETE
            );
        } else {
            console.log(`[WORKER] Mailbox ${mailbox.id} eligible for recovery (mode: ${systemMode})`);
        }
    }

    // Find paused domains with expired cooldowns
    const eligibleDomains = await prisma.domain.findMany({
        where: {
            organization_id: organizationId,
            status: DomainState.PAUSED,
            cooldown_until: { lte: now }
        },
        select: { id: true }
    });

    for (const domain of eligibleDomains) {
        if (systemMode === 'enforce') {
            await stateTransitionService.transitionDomain(
                organizationId,
                domain.id,
                DomainState.RECOVERING,
                'Cooldown period expired - entering recovery',
                TriggerType.COOLDOWN_COMPLETE
            );
        } else {
            console.log(`[WORKER] Domain ${domain.id} eligible for recovery (mode: ${systemMode})`);
        }
    }
}

// ============================================================================
// DOMAIN AGGREGATION
// ============================================================================

/**
 * Update domain health based on mailbox states.
 */
async function updateDomainHealth(
    organizationId: string,
    domainId: string,
    systemMode: string
): Promise<void> {
    const domainMetrics = await metricsService.getDomainRiskMetrics(domainId);

    // Get current domain state
    const domain = await prisma.domain.findUnique({
        where: { id: domainId },
        select: { status: true, warning_count: true }
    });

    if (!domain) return;

    const currentState = domain.status as DomainState;
    const totalMailboxes = await prisma.mailbox.count({ where: { domain_id: domainId } });
    const atRiskRatio = totalMailboxes > 0 ? domainMetrics.atRiskCount / totalMailboxes : 0;

    let targetState: DomainState | null = null;
    let reason = '';

    // Determine target state based on aggregate metrics (RATIO-BASED)
    if (currentState === DomainState.HEALTHY) {
        if (atRiskRatio >= MONITORING_THRESHOLDS.DOMAIN_PAUSE_RATIO) {
            targetState = DomainState.PAUSED;
            reason = `${(atRiskRatio * 100).toFixed(0)}% mailboxes at risk (${domainMetrics.atRiskCount}/${totalMailboxes}) - exceeds ${(MONITORING_THRESHOLDS.DOMAIN_PAUSE_RATIO * 100).toFixed(0)}% threshold`;
        } else if (atRiskRatio >= MONITORING_THRESHOLDS.DOMAIN_WARNING_RATIO || domainMetrics.averageRiskScore >= MONITORING_THRESHOLDS.RISK_SCORE_WARNING) {
            targetState = DomainState.WARNING;
            reason = `Domain at ${(atRiskRatio * 100).toFixed(0)}% risk ratio or avg score ${domainMetrics.averageRiskScore.toFixed(0)} exceeds warning`;
        }
    } else if (currentState === DomainState.WARNING) {
        if (atRiskRatio >= MONITORING_THRESHOLDS.DOMAIN_PAUSE_RATIO) {
            targetState = DomainState.PAUSED;
            reason = `${(atRiskRatio * 100).toFixed(0)}% mailboxes at risk - escalating to pause`;
        } else if (atRiskRatio < MONITORING_THRESHOLDS.DOMAIN_WARNING_RATIO * 0.5 && domainMetrics.averageRiskScore < MONITORING_THRESHOLDS.RISK_SCORE_WARNING * 0.5) {
            targetState = DomainState.HEALTHY;
            reason = 'Domain risk normalized';
        }
    }

    // Update aggregated metrics
    await prisma.domain.update({
        where: { id: domainId },
        data: {
            aggregated_bounce_rate_trend: domainMetrics.averageRiskScore,
            warning_count: domainMetrics.atRiskCount
        }
    });

    // Execute state transition if needed
    if (targetState && targetState !== currentState) {
        if (systemMode === 'enforce') {
            await stateTransitionService.transitionDomain(
                organizationId,
                domainId,
                targetState,
                reason,
                TriggerType.SYSTEM
            );
        } else {
            console.log(`[WORKER] Would transition domain ${domainId} from ${currentState} to ${targetState} (mode: ${systemMode})`);
        }
    }
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export const __testing = {
    processOrganization,
    processMailbox,
    checkRecoveryEligibility,
    updateDomainHealth
};
