import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma
export const prisma = new PrismaClient();

// Import middleware
import { extractOrgContext } from './middleware/orgContext';

// Import routes
import leadRoutes from './routes/leads';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import syncRoutes from './routes/sync';

// Import controllers
import * as monitoringController from './controllers/monitoringController';
import * as ingestionController from './controllers/ingestionController';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
    try {
        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: 'ok',
            timestamp: new Date(),
            version: '2.0.0',
            components: {
                database: 'healthy',
                api: 'healthy'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'degraded',
            timestamp: new Date(),
            components: {
                database: 'unhealthy',
                api: 'healthy'
            }
        });
    }
});

// Apply organization context middleware to all /api routes
app.use('/api', extractOrgContext);

// API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sync', syncRoutes);

// Ingestion endpoints
app.post('/api/ingest', ingestionController.ingestLead);
app.post('/api/ingest/clay', ingestionController.ingestClayWebhook);

// Monitoring endpoints
app.post('/api/monitor/event', monitoringController.triggerEvent);
app.post('/api/monitor/smartlead-webhook', monitoringController.handleSmartleadWebhook);

// Routing Rules (shared with dashboard router)
app.post('/api/dashboard/routing-rules', dashboardRoutes);

// Organization management endpoints (Phase 1 addition)
app.get('/api/organization', async (req, res) => {
    const orgId = req.orgContext?.organizationId;
    if (!orgId) {
        return res.status(401).json({ error: 'Organization context required' });
    }

    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: {
            id: true,
            name: true,
            slug: true,
            system_mode: true,
            created_at: true
        }
    });

    res.json(org);
});

// Update organization settings
app.patch('/api/organization', async (req, res) => {
    const orgId = req.orgContext?.organizationId;
    if (!orgId) {
        return res.status(401).json({ error: 'Organization context required' });
    }

    const { name, system_mode } = req.body;

    // Validate system_mode if provided
    if (system_mode && !['observe', 'suggest', 'enforce'].includes(system_mode)) {
        return res.status(400).json({ error: 'Invalid system_mode. Must be: observe, suggest, or enforce' });
    }

    const org = await prisma.organization.update({
        where: { id: orgId },
        data: {
            ...(name && { name }),
            ...(system_mode && { system_mode })
        }
    });

    res.json(org);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
