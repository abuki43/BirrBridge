import { Hono } from 'hono';
import authRoutes from './routes/auth';

const app = new Hono();

app.route('/api/webhooks/privy', authRoutes);

app.get('/', (c) => c.text('BirrBridge API'));

export default app;
