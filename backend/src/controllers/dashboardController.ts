import { Request, Response } from 'express';
import { prisma } from '../index';

// Leads Statistics & List
export const getLeads = async (req: Request, res: Response) => {
    const leads = await prisma.lead.findMany({
        orderBy: { created_at: 'desc' },
        take: 100,
    });
    res.json(leads);
};

export const getStats = async (req: Request, res: Response) => {
    const activeCount = await prisma.lead.count({ where: { status: 'active' } });
    const heldCount = await prisma.lead.count({ where: { status: 'held' } });
    const pausedCount = await prisma.lead.count({ where: { status: 'paused' } });

    res.json({ activeCount, heldCount, pausedCount });
};

export const getCampaigns = async (req: Request, res: Response) => {
    const campaigns = await prisma.campaign.findMany({
        include: {
            mailboxes: {
                include: { domain: true }
            }
        }
    });
    res.json(campaigns);
};

// Domains
export const getDomains = async (req: Request, res: Response) => {
    const domains = await prisma.domain.findMany({
        include: {
            mailboxes: {
                select: {
                    id: true,
                    email: true,
                    status: true,
                    campaigns: { select: { id: true, name: true } }
                }
            }
        }
    });
    res.json(domains);
};

// Mailboxes
export const getMailboxes = async (req: Request, res: Response) => {
    const mailboxes = await prisma.mailbox.findMany({
        include: {
            domain: true,
            campaigns: { select: { id: true, name: true } }
        }
    });
    res.json(mailboxes);
};

// Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
    const { entity, entity_id } = req.query;
    const whereClause: any = {};

    if (entity) whereClause.entity = String(entity);
    if (entity_id) whereClause.entity_id = String(entity_id);

    const logs = await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: 50,
    });
    res.json(logs);
};

// Routing Rules
export const getRoutingRules = async (req: Request, res: Response) => {
    const rules = await prisma.routingRule.findMany({
        orderBy: { priority: 'desc' },
    });
    res.json(rules);
};

export const createRoutingRule = async (req: Request, res: Response) => {
    const { persona, min_score, target_campaign_id, priority } = req.body;
    const rule = await prisma.routingRule.create({
        data: { persona, min_score, target_campaign_id, priority },
    });
    res.json(rule);
};
