import { Hono } from 'hono';
import { registerErrorHandler } from './middleware/error-handler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import bankAccountRoutes from './routes/bank-accounts.js';
import depositRoutes from './routes/deposit.js';
import webhookRoutes from './routes/webhooks.js';

const app = new Hono();

registerErrorHandler(app);

// Webhooks (no auth)
app.route('/api/webhooks/privy', authRoutes);
app.route('/api/webhooks', webhookRoutes);

// User
app.route('/api/user/bank-accounts', bankAccountRoutes);
app.route('/api/user', userRoutes);
app.route('/api/users', userRoutes); // /api/users/search

// Deposits
app.route('/api/deposit', depositRoutes);

app.get('/', (c) => c.text('BirrBridge API'));

export default app;
