import { Hono } from 'hono';
import { ZodError } from 'zod';

export function registerErrorHandler(app: Hono) {
  app.onError((err, c) => {
    const requestId = c.get('requestId');

    if (err instanceof ZodError) {
      return c.json({ error: 'Validation error', issues: err.issues, requestId }, 400);
    }

    console.error(JSON.stringify({ requestId, error: err.message, stack: err.stack }));
    return c.json({ error: 'Internal server error', requestId }, 500);
  });
}
