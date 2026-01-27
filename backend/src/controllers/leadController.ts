import { Request, Response } from 'express';
import * as leadService from '../services/leadService';

export const ingestLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, persona, lead_score, workable } = req.body;

        // 1. Validate Payload
        if (!email || !persona || lead_score === undefined || workable !== true) {
            res.status(400).json({ error: 'Invalid payload: Missing required fields or not workable' });
            return;
        }

        // 2. Create Lead (Held)
        const lead = await leadService.createLead({
            email,
            persona,
            lead_score,
        });

        res.status(201).json({ message: 'Lead ingested successfully', lead });
    } catch (error) {
        console.error('Error ingesting lead:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
