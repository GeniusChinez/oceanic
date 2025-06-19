/* eslint-disable no-var */
import Redis from "ioredis";

declare global {
  // allow global `var` reuse
  var __redis: Redis | undefined;
}

if (!global.__redis) {
  global.__redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    // password: "yourpassword", // optional
  });
}

const redis = global.__redis;
export { redis };
