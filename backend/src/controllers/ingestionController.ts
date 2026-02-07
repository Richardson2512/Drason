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

export const ingestClayWebhook = async (req: Request, res: Response) => {
    // Clay sends the row data as the body.
    // We expect keys like 'Email', 'email', 'Persona', 'Job Title', 'Lead Score', etc.
    // We will normalize keys to lowercase to be flexible.

    console.log('[INGEST CLAY] Received payload:', JSON.stringify(req.body).substring(0, 200));

    const payload = req.body;

    // Helper to find value case-insensitively
    const findVal = (keys: string[]): any => {
        for (const k of keys) {
            if (payload[k] !== undefined) return payload[k];
            // try lowercase
            const lowerKey = Object.keys(payload).find(pk => pk.toLowerCase() === k.toLowerCase());
            if (lowerKey) return payload[lowerKey];
        }
        return undefined;
    };

    const email = findVal(['email', 'e-mail', 'work email']);
    // Fallback persona to 'General' if not found
    const persona = findVal(['persona', 'job title', 'title', 'role']) || 'General';
    // Fallback score to 50 if not found
    const lead_score = parseInt(findVal(['lead score', 'score', 'lead_score']) || '50', 10);

    if (!email) {
        console.error('[INGEST CLAY] Missing email in payload');
        return res.status(400).json({ error: 'Missing email field in Clay payload' });
    }

    try {
        // Reuse logic? ideally extract service method. 
        // For MVP, just copy critical path or refactor. Refactoring is better.
        // Let's refactor ingestLead to use a service method, but for now I'll just call the logic directly to avoid breaking existing ingestLead.

        // 1. Create/Upsert Lead
        // We use upsert here because Clay might re-push or we might have seen them.
        const createdLead = await prisma.lead.upsert({
            where: { email },
            update: {
                persona,
                lead_score,
                source: 'clay'
            },
            create: {
                email,
                persona,
                lead_score,
                source: 'clay',
                status: 'held',
                health_state: 'healthy'
            }
        });

        // 2. Resolve Route
        const campaignId = await routingService.resolveCampaignForLead(createdLead);

        // 3. Update Lead
        if (campaignId) {
            await prisma.lead.update({
                where: { id: createdLead.id },
                data: { assigned_campaign_id: campaignId }
            });
            console.log(`[INGEST CLAY] Assigned lead ${createdLead.id} to campaign ${campaignId}`);
            await auditLogService.logAction('lead', createdLead.id, 'ingestion', 'assigned', `Routed to campaign ${campaignId} via Clay webhook.`);
        } else {
            console.log(`[INGEST CLAY] No campaign matched for lead ${createdLead.id}`);
            await auditLogService.logAction('lead', createdLead.id, 'ingestion', 'unassigned', `No routing rule matched for Clay lead.`);
        }

        res.json({ message: 'Clay lead processed', leadId: createdLead.id, success: true });

    } catch (e) {
        console.error('[INGEST CLAY] Error processing webhook:', e);
        res.status(500).json({ error: 'Internal error processing Clay webhook' });
    }
};
