import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';

const router = Router();

router.get('/', settingsController.getSettings);
router.post('/', settingsController.updateSettings);

export default router;
