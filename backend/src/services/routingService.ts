import { prisma } from '../index';
import { Lead } from '@prisma/client';
import * as auditLogService from './auditLogService';

export const resolveCampaignForLead = async (lead: Lead): Promise<string | null> => {
    // 1. Fetch all rules ordered by priority (descending)
    const rules = await prisma.routingRule.findMany({
        orderBy: {
            priority: 'desc',
        },
    });

    console.log(`[ROUTING] Found ${rules.length} rules. Processing lead: ${lead.persona}, ${lead.lead_score}`);

    // 2. Iterate and match
    for (const rule of rules) {
        console.log(`[ROUTING] Checking rule ${rule.id}: Persona=${rule.persona}, MinScore=${rule.min_score}`);

        // Check Persona Match (Case-insensitive for robustness)
        const personaMatch = rule.persona.toLowerCase() === lead.persona.toLowerCase();

        // Check Score Match
        const scoreMatch = lead.lead_score >= rule.min_score;

        console.log(`[ROUTING] Match Result: Persona=${personaMatch}, Score=${scoreMatch}`);

        if (personaMatch && scoreMatch) {
            await auditLogService.logAction(
                'lead',
                lead.id,
                'ingestion_routing',
                'route_matched',
                `Matched rule ${rule.id} -> Campaign ${rule.target_campaign_id}`
            );
            return rule.target_campaign_id;
        }
    }

    await auditLogService.logAction(
        'lead',
        lead.id,
        'ingestion_routing',
        'no_route_matched',
        `No matching rule found for Persona: ${lead.persona}, Score: ${lead.lead_score}`
    );

    return null;
};
