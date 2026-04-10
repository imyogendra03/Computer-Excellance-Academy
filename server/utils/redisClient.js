const Redis = require("ioredis");

let redisClient;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
  
  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });
} else {
  console.warn("REDIS_URL not found. Using in-memory mock for OTP storage.");
  const storage = new Map();
  redisClient = {
    get: async (key) => storage.get(key) || null,
    set: async (key, val, mode, ttl) => {
      storage.set(key, val);
      if (ttl) setTimeout(() => storage.delete(key), ttl * 1000);
    },
    del: async (key) => storage.delete(key),
    incr: async (key) => {
      const nextValue = Number(storage.get(key) || 0) + 1;
      storage.set(key, String(nextValue));
      return nextValue;
    },
    on: () => {},
  };
}

module.exports = redisClient;
