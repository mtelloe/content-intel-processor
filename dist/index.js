import express from 'express';
import { createWebhookRouter } from './webhook.js';
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use('/webhook', createWebhookRouter());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
const port = parseInt(process.env.PORT ?? '3000', 10);
app.listen(port, () => console.log(`Content Intel Processor running on port ${port}`));
