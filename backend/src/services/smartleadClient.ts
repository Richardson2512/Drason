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
    const campsRes = await axios.get<{ id: number; name: string; status: string }[]>(`${SMARTLEAD_BASE_URL}/campaigns`, {
        params: { api_key: apiKey }
    });
    const campaigns = campsRes.data || [];

    for (const c of campaigns) {
        // Upsert Campaign
        // Logic: If remote is COMPLETED, we pause. If remote is ACTIVE, we set to active UNLESS we have a local reason to pause?
        // Simpler for now: Sync status directly but maybe allow a "manual override" column later. 
        // Current rule: If Smartlead says active, we trust it, but our monitoring might pause it again immediately if unhealthy.
        const status = (c.status === 'COMPLETED' || c.status === 'PAUSED') ? 'paused' : 'active';

        await prisma.campaign.upsert({
            where: { id: String(c.id) },
            update: {
                name: c.name,
                // If the campaign is active in Smartlead, we allow it to be active here.
                // If it was paused by our monitoring, our monitoring service will re-pause it on next check if still unhealthy.
                status: status
            },
            create: {
                id: String(c.id),
                name: c.name,
                status: status,
                channel: 'email'
            }
        });

        // 2. Fetch Mailboxes for this Campaign
        try {
            const accRes = await axios.get<{ id: number; from_email: string; status: string }[]>(`${SMARTLEAD_BASE_URL}/campaigns/${c.id}/email-accounts`, {
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
                        // Sync status from Smartlead. 
                        // If Smartlead says it's active, we mark it active.
                        // Our monitoring service runs separately and will pause it if bounce rate is high.
                        // This allows a "reset" if the user fixes it in Smartlead.
                        status: 'active'
                    },
                    create: {
                        id: String(acc.id),
                        email: acc.from_email,
                        domain_id: domain.id,
                        status: 'active',
                    }
                });

                // Link Mailbox to Campaign
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
