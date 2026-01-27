import { Request, Response } from 'express';
import { prisma } from '../index';
import * as routingService from '../services/routingService';
import * as auditLogService from '../services/auditLogService';

export const ingestLead = async (req: Request, res: Response) => {
    const { email, persona, lead_score, source } = req.body;

    if (!email || !persona || lead_score === undefined) {
        return res.status(400).json({ error: 'Missing required fields: email, persona, lead_score' });
    }

    console.log(`[INGEST] Received lead: ${email} (${persona}, ${lead_score})`);

    try {
        // 1. Create initial lead object (in memory or basic DB object) for routing context
        // We'll insert it into DB *after* we know the campaign, or update it immediately.
        // Let's create it first to have an ID.
        const createdLead = await prisma.lead.create({
            data: {
                email,
                persona,
                lead_score,
                source: source || 'api',
                status: 'held', // Start as held, waiting for processor/gate
                health_state: 'healthy'
            }
        });

        // 2. Resolve Route
        const campaignId = await routingService.resolveCampaignForLead(createdLead);

        // 3. Update Lead with Campaign (if found)
        if (campaignId) {
            await prisma.lead.update({
                where: { id: createdLead.id },
                data: { assigned_campaign_id: campaignId }
            });
            console.log(`[INGEST] Assigned lead ${createdLead.id} to campaign ${campaignId}`);

            await auditLogService.logAction(
                'lead',
                createdLead.id,
                'ingestion',
                'assigned',
                `Routed to campaign ${campaignId} based on rules.`
            );
        } else {
            console.log(`[INGEST] No campaign matched for lead ${createdLead.id}`);
            await auditLogService.logAction(
                'lead',
                createdLead.id,
                'ingestion',
                'unassigned',
                `No routing rule matched. Lead remains in holding pool.`
            );
        }

        res.json({
            message: 'Lead ingested successfully',
            leadId: createdLead.id,
            assignedCampaignId: campaignId
        });

    } catch (error) {
        console.error('[INGEST] Error:', error);
        res.status(500).json({ error: 'Internal server error during ingestion' });
    }
};
