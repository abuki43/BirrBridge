import { Hono } from 'hono';
import { registerErrorHandler } from './middleware/error-handler.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import privyWebhookRoutes from './routes/privy-webhook.js';
import webhookRoutes from './routes/webhooks.js';
import userRoutes from './routes/user.js';
import bankAccountRoutes from './routes/bank-accounts.js';
import depositRoutes from './routes/deposit.js';

const app = new Hono();

registerErrorHandler(app);

app.use(corsMiddleware);
app.use(requestIdMiddleware);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Webhooks (no version prefix, no auth)
app.route('/api/webhooks/privy', privyWebhookRoutes);
app.route('/api/webhooks', webhookRoutes);

// API v1
const v1 = new Hono();
v1.route('/user', userRoutes);
v1.route('/users', userRoutes);
v1.route('/user/bank-accounts', bankAccountRoutes);
v1.route('/deposit', depositRoutes);

app.route('/api/v1', v1);

app.get('/', (c) => c.text('BirrBridge API'));

export default app;
