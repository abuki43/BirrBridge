import { Hono } from 'hono';
import authRoutes from './routes/auth.js';
import { registerErrorHandler } from './middleware/error-handler.js';

const app = new Hono();

registerErrorHandler(app);

app.route('/api/webhooks/privy', authRoutes);

app.get('/', (c) => c.text('BirrBridge API'));

export default app;
