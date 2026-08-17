import { Redis } from "@upstash/redis";

const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Reuse the Upstash Redis instance globally when credentials exist, otherwise null
export const redis: Redis | null = hasRedisConfig ? Redis.fromEnv() : null;
