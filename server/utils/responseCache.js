const redisClient = require("./redisClient");

async function getNamespaceVersion(namespace) {
  const version = await redisClient.get(`cache:version:${namespace}`);
  return version || "1";
}

async function createVersionedKey(namespace, suffix) {
  const version = await getNamespaceVersion(namespace);
  return `cache:${namespace}:v${version}:${suffix}`;
}

async function readThroughCache(namespace, suffix, ttlSeconds, producer) {
  const cacheKey = await createVersionedKey(namespace, suffix);
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const freshValue = await producer();
  await redisClient.set(cacheKey, JSON.stringify(freshValue), "EX", ttlSeconds);
  return freshValue;
}

async function invalidateNamespace(namespace) {
  await redisClient.incr(`cache:version:${namespace}`);
}

module.exports = {
  readThroughCache,
  invalidateNamespace,
};
