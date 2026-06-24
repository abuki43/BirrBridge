import {} from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    privyUserId: string;
    dbUserId: string;
    adminId: string;
    adminRole: string;
    requestId: string;
  }
}
