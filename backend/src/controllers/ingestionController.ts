/**
 * Ingestion Controller
 * 
 * Handles lead ingestion from direct API calls and Clay webhooks.
 * All leads are created with organization context for multi-tenancy.
 * 
 * Section 6 of Audit: Lead Ingestion Flow
 */

import { Request, Response } from 'express';
import { prisma } from '../index';
import * as routingService from '../services/routingService';
import * as auditLogService from '../services/auditLogService';
import * as eventService from '../services/eventService';
import { getOrgId } from '../middleware/orgContext';
import { EventType, LeadState } from '../types';

/**
 * Direct API lead ingestion.
 * POST /api/ingest
 */
export const ingestLead = async (req: Request, res: Response) => {
    const { email, persona, lead_score, source } = req.body;

    if (!email || !persona || lead_score === undefined) {
        return res.status(400).json({ error: 'Missing required fields: email, persona, lead_score' });
    }

    // Get organization context
    let organizationId: string;
    try {
        organizationId = getOrgId(req);
    } catch (error) {
        return res.status(401).json({ error: 'Organization context required' });
    }

    console.log(`[INGEST] Org: ${organizationId} | Lead: ${email} (${persona}, ${lead_score})`);

    try {
        // Generate idempotency key for event storage
        const idempotencyKey = `${organizationId}:lead:${email}`;

        // Store raw event first (Section 5.1 - store before processing)
        await eventService.storeEvent({
            organizationId,
            eventType: EventType.LEAD_INGESTED,
            entityType: 'lead',
            payload: { email, persona, lead_score, source: source || 'api' },
            idempotencyKey
        });

        // Create the lead with organization scope
        const createdLead = await prisma.lead.upsert({
            where: {
                organization_id_email: {
                    organization_id: organizationId,
                    email
                }
            },
            update: {
                persona,
                lead_score,
                source: source || 'api'
            },
            create: {
                email,
                persona,
                lead_score,
                source: source || 'api',
                status: LeadState.HELD,
                health_state: 'healthy',
                organization_id: organizationId
            }
        });

        // Resolve routing with org context
        const campaignId = await routingService.resolveCampaignForLead(organizationId, createdLead);

        // Update lead with assigned campaign
        if (campaignId) {
            await prisma.lead.update({
                where: { id: createdLead.id },
                data: { assigned_campaign_id: campaignId }
            });
            console.log(`[INGEST] Assigned lead ${createdLead.id} to campaign ${campaignId}`);

            await auditLogService.logAction({
                organizationId,
                entity: 'lead',
                entityId: createdLead.id,
                trigger: 'ingestion',
                action: 'assigned',
                details: `Routed to campaign ${campaignId} based on rules.`
            });
        } else {
            console.log(`[INGEST] No campaign matched for lead ${createdLead.id}`);
            await auditLogService.logAction({
                organizationId,
                entity: 'lead',
                entityId: createdLead.id,
                trigger: 'ingestion',
                action: 'unassigned',
                details: `No routing rule matched. Lead remains in holding pool.`
            });
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

/**
 * Clay webhook lead ingestion.
 * POST /api/ingest/clay
 * 
 * Handles flexible Clay payload format with case-insensitive field lookup.
 */
export const ingestClayWebhook = async (req: Request, res: Response) => {
    console.log('[INGEST CLAY] Received payload:', JSON.stringify(req.body).substring(0, 200));

    const payload = req.body;

    // Get organization context
    let organizationId: string;
    try {
        organizationId = getOrgId(req);
    } catch (error) {
        return res.status(401).json({ error: 'Organization context required' });
    }

    // Helper to find value case-insensitively
    const findVal = (keys: string[]): any => {
        for (const k of keys) {
            if (payload[k] !== undefined) return payload[k];
            const lowerKey = Object.keys(payload).find(pk => pk.toLowerCase() === k.toLowerCase());
            if (lowerKey) return payload[lowerKey];
        }
        return undefined;
    };

    const email = findVal(['email', 'e-mail', 'work email']);
    const persona = findVal(['persona', 'job title', 'title', 'role']) || 'General';
    const lead_score = parseInt(findVal(['lead score', 'score', 'lead_score']) || '50', 10);

    if (!email) {
        console.error('[INGEST CLAY] Missing email in payload');
        return res.status(400).json({ error: 'Missing email field in Clay payload' });
    }

    try {
        // Generate idempotency key
        const externalId = findVal(['id', 'external_id', 'row_id']) || email;
        const idempotencyKey = `${organizationId}:clay:${externalId}`;

        // Store raw event first
        await eventService.storeEvent({
            organizationId,
            eventType: EventType.LEAD_INGESTED,
            entityType: 'lead',
            payload,
            idempotencyKey
        });

        // Create/update lead with organization scope
        const createdLead = await prisma.lead.upsert({
            where: {
                organization_id_email: {
                    organization_id: organizationId,
                    email
                }
            },
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
                status: LeadState.HELD,
                health_state: 'healthy',
                organization_id: organizationId
            }
        });

        // Resolve routing
        const campaignId = await routingService.resolveCampaignForLead(organizationId, createdLead);

        if (campaignId) {
            await prisma.lead.update({
                where: { id: createdLead.id },
                data: { assigned_campaign_id: campaignId }
            });
            console.log(`[INGEST CLAY] Assigned lead ${createdLead.id} to campaign ${campaignId}`);
            await auditLogService.logAction({
                organizationId,
                entity: 'lead',
                entityId: createdLead.id,
                trigger: 'ingestion',
                action: 'assigned',
                details: `Routed to campaign ${campaignId} via Clay webhook.`
            });
        } else {
            console.log(`[INGEST CLAY] No campaign matched for lead ${createdLead.id}`);
            await auditLogService.logAction({
                organizationId,
                entity: 'lead',
                entityId: createdLead.id,
                trigger: 'ingestion',
                action: 'unassigned',
                details: `No routing rule matched for Clay lead.`
            });
        }

        res.json({ message: 'Clay lead processed', leadId: createdLead.id, success: true });

    } catch (e) {
        console.error('[INGEST CLAY] Error processing webhook:', e);
        res.status(500).json({ error: 'Internal error processing Clay webhook' });
    }
};
