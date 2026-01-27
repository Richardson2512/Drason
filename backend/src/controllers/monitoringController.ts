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
