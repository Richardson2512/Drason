/**
 * Notification Controller
 * 
 * Handles API requests for notifications.
 */

import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';
import { getOrgId } from '../middleware/orgContext';

/**
 * Get notifications for the organization.
 */
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const filter = req.query.filter as 'all' | 'unread' || 'all';

        const result = await notificationService.getNotifications(orgId, page, limit, filter);
        res.json(result);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get unread count.
 */
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const count = await notificationService.getUnreadCount(orgId);
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Mark a notification as read.
 */
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;

        await notificationService.markAsRead(orgId, id as string);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Mark all notifications as read.
 */
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const orgId = getOrgId(req);
        await notificationService.markAllAsRead(orgId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
