import { Router } from 'express';
import { Request, Response } from 'express';
import * as smartleadClient from '../services/smartleadClient';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const result = await smartleadClient.syncSmartlead();
        res.json({ success: true, result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
