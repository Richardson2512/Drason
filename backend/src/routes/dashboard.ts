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

// Lead Health Gate endpoints
router.get('/lead-health-stats', dashboardController.getLeadHealthStats);

// Campaign Health endpoints
router.get('/campaign-health-stats', dashboardController.getCampaignHealthStats);
router.post('/campaign/pause', dashboardController.pauseCampaign);
router.post('/campaign/resume', dashboardController.resumeCampaign);

// Notification endpoints
import * as notificationController from '../controllers/notificationController';
router.get('/notifications', notificationController.getNotifications);
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.post('/notifications/:id/read', notificationController.markAsRead);
router.post('/notifications/read-all', notificationController.markAllAsRead);

export default router;
