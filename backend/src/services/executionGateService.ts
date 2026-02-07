/**
 * Execution Gate Service
 * 
 * Section 9 of Audit: Execution Gate Logic (Full Model)
 * Section 10 of Audit: System Modes
 * 
 * Gate allows execution only if ALL conditions are met:
 * - Campaign active
 * - Domain not paused
 * - Mailbox available and not in cooldown
 * - Risk score below threshold
 * - System mode permits enforcement
 */

import { prisma } from '../index';
import * as auditLogService from './auditLogService';
import {
    SystemMode,
    GateResult,
    MONITORING_THRESHOLDS
} from '../types';

const { RISK_SCORE_CRITICAL } = MONITORING_THRESHOLDS;

/**
 * Check if a lead can be executed (pushed to campaign).
 * Returns detailed gate result including recommendations.
 */
export const canExecuteLead = async (
    organizationId: string,
    campaignId: string,
    leadId: string
): Promise<GateResult> => {
    // Get organization to check system mode
    const org = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    const systemMode = (org?.system_mode as SystemMode) || SystemMode.OBSERVE;
    const recommendations: string[] = [];

    // Initialize check results
    const checks = {
        campaignActive: false,
        domainHealthy: false,
        mailboxAvailable: false,
        belowCapacity: true,
        riskAcceptable: true
    };

    // 1. Validate Campaign
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign) {
        await auditLogService.logAction({
            organizationId,
            entity: 'lead',
            entityId: leadId,
            trigger: 'gate_check',
            action: 'gate_failed',
            details: `Campaign ${campaignId} not found`
        });
        return {
            allowed: false,
            reason: `Campaign ${campaignId} not found`,
            riskScore: 0,
            recommendations: ['Verify campaign exists in Smartlead and sync'],
            mode: systemMode,
            checks
        };
    }

    if (campaign.status !== 'active') {
        recommendations.push(`Campaign is ${campaign.status}. Activate to proceed.`);
        await auditLogService.logAction({
            organizationId,
            entity: 'lead',
            entityId: leadId,
            trigger: 'gate_check',
            action: 'gate_failed',
            details: `Campaign ${campaignId} is ${campaign.status}`
        });
        return {
            allowed: false,
            reason: `Campaign ${campaignId} is ${campaign.status}`,
            riskScore: 0,
            recommendations,
            mode: systemMode,
            checks
        };
    }
    checks.campaignActive = true;

    // 2. Find healthy mailboxes with healthy domains
    const healthyMailboxes = await prisma.mailbox.findMany({
        where: {
            organization_id: organizationId,
            status: 'healthy',
            cooldown_until: {
                OR: [
                    { equals: null },
                    { lt: new Date() }
                ]
            } as any,
            domain: {
                status: 'healthy'
            }
        },
        include: {
            domain: true,
            metrics: true
        }
    });

    if (healthyMailboxes.length === 0) {
        // Check why no mailboxes are available
        const totalMailboxes = await prisma.mailbox.count({
            where: { organization_id: organizationId }
        });

        if (totalMailboxes === 0) {
            recommendations.push('No mailboxes configured. Sync with Smartlead.');
        } else {
            recommendations.push('All mailboxes are paused or in cooldown. Wait for recovery.');
        }

        await auditLogService.logAction({
            organizationId,
            entity: 'lead',
            entityId: leadId,
            trigger: 'gate_check',
            action: 'gate_failed',
            details: 'No healthy mailboxes available'
        });
        return {
            allowed: false,
            reason: 'No healthy mailboxes available',
            riskScore: 100,
            recommendations,
            mode: systemMode,
            checks
        };
    }
    checks.mailboxAvailable = true;
    checks.domainHealthy = true;

    // 3. Calculate aggregate risk score
    let totalRiskScore = 0;
    for (const mailbox of healthyMailboxes) {
        if (mailbox.metrics) {
            totalRiskScore += mailbox.metrics.risk_score;
        }
    }
    const avgRiskScore = healthyMailboxes.length > 0
        ? totalRiskScore / healthyMailboxes.length
        : 0;

    if (avgRiskScore >= RISK_SCORE_CRITICAL) {
        checks.riskAcceptable = false;
        recommendations.push(`Risk score (${avgRiskScore.toFixed(1)}) exceeds threshold. Wait for cooldown.`);
    }

    // 4. Determine if allowed based on mode and checks
    const allChecksPassed = Object.values(checks).every(v => v === true);

    // In observe mode, we log but don't enforce
    if (systemMode === SystemMode.OBSERVE) {
        await auditLogService.logAction({
            organizationId,
            entity: 'lead',
            entityId: leadId,
            trigger: 'gate_check',
            action: allChecksPassed ? 'gate_passed_observe' : 'gate_would_fail_observe',
            details: `Mode: observe. Checks: ${JSON.stringify(checks)}`
        });
        return {
            allowed: true,
            reason: allChecksPassed ? 'All checks passed (observe mode)' : 'Would fail but in observe mode',
            riskScore: avgRiskScore,
            recommendations: allChecksPassed ? [] : recommendations,
            mode: systemMode,
            checks
        };
    }

    // In suggest mode, we return result but still allow
    if (systemMode === SystemMode.SUGGEST) {
        await auditLogService.logAction({
            organizationId,
            entity: 'lead',
            entityId: leadId,
            trigger: 'gate_check',
            action: allChecksPassed ? 'gate_passed' : 'gate_suggest_caution',
            details: `Mode: suggest. Checks: ${JSON.stringify(checks)}`
        });
        return {
            allowed: true,
            reason: allChecksPassed ? 'All checks passed' : 'Caution recommended (suggest mode)',
            riskScore: avgRiskScore,
            recommendations,
            mode: systemMode,
            checks
        };
    }

    // In enforce mode, we block if checks fail
    if (!allChecksPassed) {
        await auditLogService.logAction({
            organizationId,
            entity: 'lead',
            entityId: leadId,
            trigger: 'gate_check',
            action: 'gate_blocked',
            details: `Mode: enforce. Failed checks: ${Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', ')}`
        });
        return {
            allowed: false,
            reason: 'Execution blocked due to failed checks',
            riskScore: avgRiskScore,
            recommendations,
            mode: systemMode,
            checks
        };
    }

    // All checks passed in enforce mode
    await auditLogService.logAction({
        organizationId,
        entity: 'lead',
        entityId: leadId,
        trigger: 'gate_check',
        action: 'gate_passed',
        details: `Mode: enforce. ${healthyMailboxes.length} mailboxes available. Risk: ${avgRiskScore.toFixed(1)}`
    });

    return {
        allowed: true,
        reason: `Gate passed. ${healthyMailboxes.length} healthy mailboxes, risk score: ${avgRiskScore.toFixed(1)}`,
        riskScore: avgRiskScore,
        recommendations: [],
        mode: systemMode,
        checks
    };
};

/**
 * Get current system mode for an organization.
 */
export const getSystemMode = async (organizationId: string): Promise<SystemMode> => {
    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { system_mode: true }
    });
    return (org?.system_mode as SystemMode) || SystemMode.OBSERVE;
};
