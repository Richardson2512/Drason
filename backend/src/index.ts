import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma
export const prisma = new PrismaClient();

import leadRoutes from './routes/leads';
import dashboardRoutes from './routes/dashboard';
// Monitoring Test Routes
import * as monitoringController from './controllers/monitoringController';
// Ingestion Routes
import * as ingestionController from './controllers/ingestionController';

app.use(cors());
app.use(express.json());

app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// New Ingestion logic
app.post('/api/ingest', ingestionController.ingestLead);
app.post('/api/ingest/clay', ingestionController.ingestClayWebhook);

// Monitoring
app.post('/api/monitor/event', monitoringController.triggerEvent);
app.post('/api/monitor/smartlead-webhook', monitoringController.handleSmartleadWebhook);

// Settings
import settingsRoutes from './routes/settings';
app.use('/api/settings', settingsRoutes);

// Sync
import syncRoutes from './routes/sync';
app.use('/api/sync', syncRoutes);

// Routing Rules creation (exposed directly for now, usually in dashboard)
app.post('/api/dashboard/routing-rules', dashboardRoutes); // It shares the router

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
