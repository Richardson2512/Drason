import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';

const router = Router();

router.get('/', settingsController.getSettings);
router.post('/', settingsController.updateSettings);
router.get('/clay-webhook-url', settingsController.getClayWebhookUrl);

export default router;

