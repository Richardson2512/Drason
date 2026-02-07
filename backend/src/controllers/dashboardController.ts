/**
 * Dashboard Controller
 * 
 * Provides endpoints for the UI dashboard to fetch data.
 * All queries are scoped to the organization context.
 */

import { Request, Response } from 'express';
import { prisma } from '../index';
import { getOrgId } from '../middleware/orgContext';
import * as routingService from '../services/routingService';

/**
 * Get all leads for the organization.
 */
export const getLeads = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);

        const leads = await prisma.lead.findMany({
            where: {
                organization_id: orgId,
                deleted_at: null  // Exclude soft-deleted leads
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(leads);
    } catch (error) {
        console.error('[DASHBOARD] getLeads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

/**
 * Get dashboard statistics.
 */
export const getStats = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);

        const [activeCount, heldCount, pausedCount, completedCount] = await Promise.all([
            prisma.lead.count({ where: { organization_id: orgId, status: 'active', deleted_at: null } }),
            prisma.lead.count({ where: { organization_id: orgId, status: 'held', deleted_at: null } }),
            prisma.lead.count({ where: { organization_id: orgId, status: 'paused', deleted_at: null } }),
            prisma.lead.count({ where: { organization_id: orgId, status: 'completed', deleted_at: null } })
        ]);

        res.json({ active: activeCount, held: heldCount, paused: pausedCount, completed: completedCount });
    } catch (error) {
        console.error('[DASHBOARD] getStats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

/**
 * Get all campaigns with their mailboxes.
 */
export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);

        const campaigns = await prisma.campaign.findMany({
            where: { organization_id: orgId },
            include: {
                mailboxes: {
                    select: {
                        id: true,
                        email: true,
                        status: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json(campaigns);
    } catch (error) {
        console.error('[DASHBOARD] getCampaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

/**
 * Get all domains with their mailboxes.
 */
export const getDomains = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);

        const domains = await prisma.domain.findMany({
            where: { organization_id: orgId },
            include: {
                mailboxes: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        hard_bounce_count: true,
                        window_bounce_count: true
                    }
                }
            },
            orderBy: { domain: 'asc' }
        });

        res.json(domains);
    } catch (error) {
        console.error('[DASHBOARD] getDomains error:', error);
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
};

/**
 * Get all mailboxes with domain info.
 */
export const getMailboxes = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);

        const mailboxes = await prisma.mailbox.findMany({
            where: { organization_id: orgId },
            include: {
                domain: {
                    select: {
                        id: true,
                        domain: true,
                        status: true
                    }
                }
            },
            orderBy: { email: 'asc' }
        });

        res.json(mailboxes);
    } catch (error) {
        console.error('[DASHBOARD] getMailboxes error:', error);
        res.status(500).json({ error: 'Failed to fetch mailboxes' });
    }
};

/**
 * Get audit logs with optional filtering.
 */
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const { entity, limit } = req.query;

        const logs = await prisma.auditLog.findMany({
            where: {
                organization_id: orgId,
                ...(entity && { entity: entity as string })
            },
            orderBy: { timestamp: 'desc' },
            take: limit ? parseInt(limit as string, 10) : 100
        });

        res.json(logs);
    } catch (error) {
        console.error('[DASHBOARD] getAuditLogs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

/**
 * Get routing rules.
 */
export const getRoutingRules = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const rules = await routingService.getRules(orgId);
        res.json(rules);
    } catch (error) {
        console.error('[DASHBOARD] getRoutingRules error:', error);
        res.status(500).json({ error: 'Failed to fetch routing rules' });
    }
};

/**
 * Create a new routing rule.
 */
export const createRoutingRule = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const { persona, min_score, target_campaign_id, priority } = req.body;

        if (!persona || !target_campaign_id) {
            return res.status(400).json({ error: 'Missing required fields: persona, target_campaign_id' });
        }

        const rule = await routingService.createRule(orgId, {
            persona,
            min_score: min_score || 0,
            target_campaign_id,
            priority: priority || 0
        });

        res.json(rule);
    } catch (error) {
        console.error('[DASHBOARD] createRoutingRule error:', error);
        res.status(500).json({ error: 'Failed to create routing rule' });
    }
};

/**
 * Get state transitions for an entity.
 */
export const getStateTransitions = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const { entityType, entityId } = req.query;

        const transitions = await prisma.stateTransition.findMany({
            where: {
                organization_id: orgId,
                ...(entityType && { entity_type: entityType as string }),
                ...(entityId && { entity_id: entityId as string })
            },
            orderBy: { created_at: 'desc' },
            take: 100
        });

        res.json(transitions);
    } catch (error) {
        console.error('[DASHBOARD] getStateTransitions error:', error);
        res.status(500).json({ error: 'Failed to fetch state transitions' });
    }
};

/**
 * Get raw events for debugging/replay.
 */
export const getRawEvents = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const { eventType, entityType, limit } = req.query;

        const events = await prisma.rawEvent.findMany({
            where: {
                organization_id: orgId,
                ...(eventType && { event_type: eventType as string }),
                ...(entityType && { entity_type: entityType as string })
            },
            orderBy: { created_at: 'desc' },
            take: limit ? parseInt(limit as string, 10) : 100
        });

        res.json(events);
    } catch (error) {
        console.error('[DASHBOARD] getRawEvents error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};
