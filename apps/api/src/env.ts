import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    PRIVY_APP_ID: z.string().min(1),
    PRIVY_APP_SECRET: z.string().min(1),
    PRIVY_WEBHOOK_SECRET: z.string().min(1),
    PRIVY_AUTHORIZATION_PRIVATE_KEY: z.string().min(1),
    PLATFORM_TREASURY_ADDRESS: z.string().min(1),
    ALCHEMY_API_KEY: z.string().min(1),
    ALCHEMY_WEBHOOK_AUTH_TOKEN: z.string().min(1),
    ALCHEMY_WEBHOOK_SIGNING_KEY: z.string().min(1),
    ALCHEMY_WEBHOOK_ID: z.string().min(1),
    CHAPA_SECRET_KEY: z.string().min(1),
    CHAPA_WEBHOOK_SECRET: z.string().min(1),
    BASE_CHAIN_ID: z.coerce.number(),
    ADMIN_JWT_SECRET: z.string().min(1),
    SENTRY_DSN: z.string().optional(),
    AXIOM_TOKEN: z.string().optional(),
    AXIOM_DATASET: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
