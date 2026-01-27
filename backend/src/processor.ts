import { prisma } from './index';
import { canExecuteLead } from './services/executionGateService';
import * as smartleadClient from './services/smartleadClient';
import * as auditLogService from './services/auditLogService';

const processHeldLeads = async () => {
    console.log('[PROCESSOR] Scanning for HELD leads...');

    // 1. Find HELD leads that have an assigned campaign
    const leads = await prisma.lead.findMany({
        where: {
            status: 'held',
            assigned_campaign_id: { not: null },
            health_state: 'healthy',
        },
        take: 50, // Batch size
    });

    console.log(`[PROCESSOR] Found ${leads.length} leads to process.`);

    for (const lead of leads) {
        if (!lead.assigned_campaign_id) continue;

        const canExecute = await executionGateService.canExecuteLead(lead.assigned_campaign_id, lead.id);

        if (canExecute) {
            // Transition to ACTIVE
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: 'active' },
            });
            await auditLogService.logAction('lead', lead.id, 'processor_gate', 'activated', 'Passed execution gate');
            console.log(`[PROCESSOR] Lead ${lead.id} ACTIVATED.`);

            // Push to Smartlead
            console.log(`[PROCESSOR] Pushing Lead ${lead.id} to Smartlead Campaign ${lead.assigned_campaign_id}...`);
            const pushed = await smartleadClient.addLeadToCampaign(lead.assigned_campaign_id!, lead);

            if (pushed) {
                console.log(`[PROCESSOR] Lead ${lead.id} successfully pushed.`);
            } else {
                console.log(`[PROCESSOR] Failed to push Lead ${lead.id} (Check API Key).`);
            }

        } else {
            // Remain HELD, log was already created by gate service
            console.log(`[PROCESSOR] Lead ${lead.id} BLOCKED.`);
        }
    }
};

// Run every 10 seconds
setInterval(processHeldLeads, 10000);

console.log('[PROCESSOR] Started.');
