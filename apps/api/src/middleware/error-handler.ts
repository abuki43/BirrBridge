import { Hono } from 'hono';
import { ZodError } from 'zod';

export function registerErrorHandler(app: Hono) {
  app.onError((err, c) => {
    if (err instanceof ZodError) {
      return c.json({ error: 'Validation error', issues: err.issues }, 400);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });
}
