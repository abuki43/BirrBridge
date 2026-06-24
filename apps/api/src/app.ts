import { Hono } from 'hono';
import { registerErrorHandler } from './middleware/error-handler.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import privyWebhookRoutes from './routes/privy-webhook.js';
import webhookRoutes from './routes/webhooks.js';
import userRoutes from './routes/user.js';
import bankAccountRoutes from './routes/bank-accounts.js';
import depositRoutes from './routes/deposit.js';
import transferRoutes from './routes/transfers.js';
import swapRoutes from './routes/swap.js';
import activityRoutes from './routes/activity.js';
import adminAuthRoutes from './routes/admin/auth.js';
import adminDashboardRoutes from './routes/admin/dashboard.js';
import adminUserRoutes from './routes/admin/users.js';
import adminTransactionRoutes from './routes/admin/transactions.js';
import adminRateRoutes from './routes/admin/rates.js';
import adminFeeRoutes from './routes/admin/fees.js';
import adminAuditLogRoutes from './routes/admin/audit-log.js';

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
v1.route('/transfers', transferRoutes);
v1.route('/swap', swapRoutes);
v1.route('/activity', activityRoutes);

// Admin API v1
const admin = new Hono();
admin.route('/auth', adminAuthRoutes);
admin.route('/dashboard', adminDashboardRoutes);
admin.route('/users', adminUserRoutes);
admin.route('/transactions', adminTransactionRoutes);
admin.route('/rates', adminRateRoutes);
admin.route('/fees', adminFeeRoutes);
admin.route('/audit-log', adminAuditLogRoutes);

v1.route('/admin', admin);

app.route('/api/v1', v1);

app.get('/', (c) => c.text('BirrBridge API'));

export default app;
