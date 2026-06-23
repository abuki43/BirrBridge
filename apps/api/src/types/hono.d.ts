import {} from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    privyUserId: string; // Privy DID e.g. did:privy:xxx
    dbUserId: string;    // Our DB User.id (cuid)
  }
}
