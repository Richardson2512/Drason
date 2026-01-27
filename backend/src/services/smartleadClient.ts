import { prisma } from '../index';
import axios from 'axios';

const SMARTLEAD_BASE_URL = 'https://server.smartlead.email/api/v1';

async function getApiKey(): Promise<string | null> {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'SMARTLEAD_API_KEY' }
    });
    return setting?.value || null;
}

export const syncSmartlead = async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error('Smartlead API Key not found. Please configure it in Settings.');
    }

    console.log('[SYNC] Starting Smartlead Sync...');

    // 1. Fetch Campaigns
    const campsRes = await axios.get(`${SMARTLEAD_BASE_URL}/campaigns`, {
        params: { api_key: apiKey }
    });
    const campaigns = campsRes.data || [];

    for (const c of campaigns) {
        // Upsert Campaign
        await prisma.campaign.upsert({
            where: { id: String(c.id) },
            update: {
                name: c.name,
                status: c.status === 'COMPLETED' ? 'paused' : (c.status === 'ACTIVE' ? 'active' : 'paused') // Map statuses
            },
            create: {
                id: String(c.id),
                name: c.name,
                status: c.status === 'ACTIVE' ? 'active' : 'paused',
                channel: 'email'
            }
        });

        // 2. Fetch Mailboxes for this Campaign accounts
        // Smartlead endpoint: /campaigns/:id/email-accounts?api_key=...
        try {
            const accRes = await axios.get(`${SMARTLEAD_BASE_URL}/campaigns/${c.id}/email-accounts`, {
                params: { api_key: apiKey }
            });
            const accounts = accRes.data || [];

            for (const acc of accounts) {
                // Upsert Domain (Infer from email)
                const domainName = acc.from_email.split('@')[1];
                let domain = await prisma.domain.findUnique({ where: { domain: domainName } });
                if (!domain) {
                    domain = await prisma.domain.create({
                        data: {
                            domain: domainName,
                            status: 'healthy'
                        }
                    });
                }

                // Upsert Mailbox
                await prisma.mailbox.upsert({
                    where: { id: String(acc.id) },
                    update: {
                        email: acc.from_email,
                        domain_id: domain.id,
                        // We do not overwrite stats locally, only sync metadata?
                        // Actually if we want to sync status from Smartlead we could.
                        // For MVP let's assume local control, so don't overwrite 'paused' status if we paused it locally?
                        // BUT, if user paused in Smartlead, we should reflect it.
                        // Let's reflect Smartlead status if helpful, but our internal logic handles pauses too.
                        // Let's sync existence primarily.
                    },
                    create: {
                        id: String(acc.id),
                        email: acc.from_email,
                        domain_id: domain.id,
                        status: 'active', // Default to active on discovery
                    }
                });

                // Link Mailbox to Campaign
                // Check if already linked ? Prisma upsert handles relation? No, explicit connect.
                // We need to simple connect.
                // Note: Prisma implicit m-n: existing connection remains.
                await prisma.campaign.update({
                    where: { id: String(c.id) },
                    data: {
                        mailboxes: {
                            connect: { id: String(acc.id) }
                        }
                    }
                });
            }

        } catch (e) {
            console.error(`Failed to sync accounts for campaign ${c.id}`, e);
        }
    }

    console.log('[SYNC] Complete.');
    return { campaigns_synced: campaigns.length };
};

export const addLeadToCampaign = async (campaignId: string, lead: any) => {
    const apiKey = await getApiKey();
    if (!apiKey) return false;

    try {
        await axios.post(`${SMARTLEAD_BASE_URL}/campaigns/${campaignId}/leads`, {
            api_key: apiKey,
            lead_list: [
                {
                    email: lead.email,
                    custom_fields: {
                        persona: lead.persona,
                        score: lead.lead_score
                    }
                }
            ]
        });
        return true;
    } catch (e) {
        console.error('Failed to push lead to Smartlead', e);
        return false;
    }
}
