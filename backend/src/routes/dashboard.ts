import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/leads', dashboardController.getLeads);
router.get('/campaigns', dashboardController.getCampaigns);
router.get('/stats', dashboardController.getStats);
router.get('/domains', dashboardController.getDomains);
router.get('/mailboxes', dashboardController.getMailboxes);
router.get('/audit-logs', dashboardController.getAuditLogs);
router.get('/routing-rules', dashboardController.getRoutingRules);
router.post('/routing-rules', dashboardController.createRoutingRule);

// New endpoints for Phase 1
router.get('/state-transitions', dashboardController.getStateTransitions);
router.get('/events', dashboardController.getRawEvents);

export default router;

