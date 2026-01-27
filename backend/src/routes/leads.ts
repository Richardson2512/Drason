import { Router } from 'express';
import * as leadController from '../controllers/leadController';

const router = Router();

router.post('/', leadController.ingestLead);

export default router;
