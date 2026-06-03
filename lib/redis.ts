import { Redis } from "@upstash/redis";

// Reuse the Upstash Redis instance globally
export const redis = Redis.fromEnv();
