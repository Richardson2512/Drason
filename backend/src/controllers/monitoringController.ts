import { Request, Response } from 'express';
import * as monitoringService from '../services/monitoringService';

export const triggerEvent = async (req: Request, res: Response): Promise<any> => {
    const { type, mailboxId, campaignId } = req.body;

    if (!type || !mailboxId) {
        return res.status(400).json({ error: 'Missing type (bounce/sent) or mailboxId' });
    }

    try {
        if (type === 'bounce') {
            await monitoringService.recordBounce(mailboxId, campaignId || 'unknown_campaign');
            return res.json({ message: 'Bounce recorded successfully' });
        } else if (type === 'sent') {
            await monitoringService.recordSent(mailboxId, campaignId || 'unknown_campaign');
            return res.json({ message: 'Sent event recorded successfully' });
        } else {
            return res.status(400).json({ error: 'Invalid event type. Use "bounce" or "sent"' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const handleSmartleadWebhook = async (req: Request, res: Response) => {
    // Smartlead Webhook Payload for 'EMAIL_BOUNCE'
    // { event_type: 'EMAIL_BOUNCE', data: { campaign_id: 123, email_account_id: 456, ... } }

    // Log payload for debug
    console.log('[SMARTLEAD WEBHOOK]', JSON.stringify(req.body).substring(0, 300));

    const { event_type, data } = req.body;

    if (!event_type || !data) {
        // Just return 200 to acknowledge receipt even if invalid format, to avoid retry loops from Smartlead? 
        // Or 400. Let's send 400 for bad requests but 200 for valid json that we just ignore.
        return res.status(400).json({ error: 'Invalid webhook format' });
    }

    try {
        if (event_type === 'EMAIL_BOUNCE') {
            const mailboxId = String(data.email_account_id);
            const campaignId = String(data.campaign_id);

            if (mailboxId) {
                console.log(`[MONITOR] Received bounce event for mailbox ${mailboxId} in campaign ${campaignId}`);
                await monitoringService.recordBounce(mailboxId, campaignId);
            } else {
                console.warn('[MONITOR] Bounce event missing email_account_id');
            }
        }
        // Handle other events if needed (e.g. EMAIL_SENT to count sends? currently we sent manually via mock/api. 
        // Ideally we should hook 'EMAIL_SENT' too for accurate window tracking!)

        else if (event_type === 'EMAIL_SENT') {
            const mailboxId = String(data.email_account_id);
            const campaignId = String(data.campaign_id);
            if (mailboxId) {
                await monitoringService.recordSent(mailboxId, campaignId);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[SMARTLEAD WEBHOOK] Error:', error);
        res.status(500).json({ error: 'Internal processing error' });
    }
};
