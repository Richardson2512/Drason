import { prisma } from '../index';
import * as auditLogService from './auditLogService';

export const canExecuteLead = async (campaignId: string, leadId: string): Promise<boolean> => {
    // 1. Validate Campaign
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
    });

    if (!campaign) {
        await auditLogService.logAction('lead', leadId, 'gate_check', 'gate_failed', `Campaign ${campaignId} not found`);
        return false;
    }

    if (campaign.status !== 'active') {
        await auditLogService.logAction('lead', leadId, 'gate_check', 'gate_failed', `Campaign ${campaignId} is ${campaign.status}`);
        return false;
    }

    // 2. Validate Domain (via mailboxes associated with campaign? No, domain model is separate)
    // Need to find which domain handles this campaign.
    // In typical setups (Smartlead), campaigns have sender accounts (mailboxes), which have domains.
    // We need to check if *any* mailbox in the campaign is on a healthy domain and is healthy itself.

    // Implementation Assumpion: For MVP, we check if there is AT LEAST ONE mailbox assigned to this campaign 
    // that is ACTIVE and its Domain is HEALTHY.
    // But wait, our current Schema doesn't explicitly link Campaign <-> Mailbox (Many-to-Many).
    // Smartlead campaigns have `email_account_ids`. 
    // Our Schema: Mailbox has `id` (Smartlead ID). Campaign has `id`. Use a simplified assumption or add relation if needed.
    // PRD 5.3 Mailbox: has `mailbox_id`.

    // CRITICAL: We need to know which mailboxes are in a campaign to check their domains.
    // Since we don't have that relation in Schema yet, let's look at PRD 5.2 Campaign (Reference Only).
    // PRD 8. Execution Gate: "At least one mailbox is available".

    // For MVP, since we don't have the Smartlead mapping synced yet, let's assume ALL active mailboxes are available for ALL campaigns 
    // OR we need to add a rudimentary relation. 
    // Let's add a rudimentary relation or just check if ANY system mailbox is healthy if we want to be loose, 
    // BUT the safe way is: Strict checks.

    // Let's assume for MVP: We check GLOBAL domain health for the campaign's intended sender domain if we knew it? 
    // Actually, without the relation, we can't be specific.
    // Let's UPDATE SCHEMA to include `CampaignMailbox` relation or just link Mailbox to Campaign.
    // For now, I will fetch ALL active mailboxes and check if at least one is healthy.

    const healthyMailboxes = await prisma.mailbox.findMany({
        where: {
            status: 'active',
            domain: {
                status: 'healthy',
            },
        },
        include: {
            domain: true,
        },
    });

    if (healthyMailboxes.length === 0) {
        await auditLogService.logAction('lead', leadId, 'gate_check', 'gate_failed', 'No healthy mailboxes available globally');
        return false;
    }

    // If specific campaign-mailbox mapping existed, we'd filter here. 
    // Since it doesn't, passing the gate implies "System has capacity".

    await auditLogService.logAction('lead', leadId, 'gate_check', 'gate_passed', `Campaign ${campaignId} valid, ${healthyMailboxes.length} mailboxes available`);
    return true;
};
