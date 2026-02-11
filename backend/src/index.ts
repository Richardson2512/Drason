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
import { rateLimit, securityHeaders } from './middleware/security';

// Import routes
import leadRoutes from './routes/leads';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import syncRoutes from './routes/sync';
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import healingRoutes from './routes/healing';

// Import controllers
import * as monitoringController from './controllers/monitoringController';
import * as ingestionController from './controllers/ingestionController';

// Import services for wiring
import { logger, correlationMiddleware, metricsMiddleware, getMetrics } from './services/observabilityService';
import { startWorker as startMetricsWorker } from './services/metricsWorker';
import { startRetentionJob } from './services/complianceService';

// Middleware
app.use(cors());
app.use(express.json());

// Phase 6: Security headers on all responses
app.use(securityHeaders);

// Phase 7: Correlation ID and metrics middleware
app.use(correlationMiddleware);
app.use(metricsMiddleware);

// Phase 6: Rate limiting on API routes
app.use('/api', rateLimit);

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
                api: 'healthy',
                metricsWorker: 'active'
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

// Phase 7: Metrics endpoint for observability
app.get('/metrics', (req, res) => {
    res.json(getMetrics());
});

// Apply organization context middleware to all /api routes
app.use('/api', extractOrgContext);

// API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/assessment', assessmentRoutes); // Infrastructure assessment routes
app.use('/api/healing', healingRoutes);        // Graduated healing system routes

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

    logger.info('Organization updated', { orgId, name, system_mode });
    res.json(org);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Phase 4: Start metrics worker for background processing
    startMetricsWorker();
    logger.info('Metrics worker started');

    // Phase 8: Start data retention job
    startRetentionJob();
    logger.info('Compliance retention job started');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
