import { prisma } from '../index';
import * as routingService from './routingService';

interface CreateLeadDTO {
    email: string;
    persona: string;
    lead_score: number;
}

export const createLead = async (data: CreateLeadDTO) => {
    // 1. Create Lead (Held)
    const lead = await prisma.lead.create({
        data: {
            email: data.email,
            persona: data.persona,
            lead_score: data.lead_score,
            status: 'held',
            health_state: 'healthy',
            source: 'clay',
        },
    });

    // 2. Resolve Route immediately
    const campaignId = await routingService.resolveCampaignForLead(lead);

    if (campaignId) {
        return await prisma.lead.update({
            where: { id: lead.id },
            data: { assigned_campaign_id: campaignId },
        });
    }

    return lead;
};
