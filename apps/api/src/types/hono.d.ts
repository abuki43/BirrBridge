import {} from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    privyUserId: string;
    dbUserId: string;
    requestId: string;
  }
}
