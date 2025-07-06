import { createClient } from "redis"
import { logger } from "../winston.js";

export const redisClient = await createClient({ url: process.env.REDIS_URL })
  .on("error", (err) => logger.error("Redis Client Error", err))
  .on('connect', () => logger.info("redis connected"))
  .connect();