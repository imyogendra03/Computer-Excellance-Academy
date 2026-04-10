const memoryCache = new Map();
const pendingRequests = new Map();

function getStorageKey(key) {
  return `cea-cache:${key}`;
}

function readSessionCache(key) {
  try {
    const raw = sessionStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed.expiresAt <= Date.now()) {
      sessionStorage.removeItem(getStorageKey(key));
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeSessionCache(key, data, ttlMs) {
  try {
    sessionStorage.setItem(
      getStorageKey(key),
      JSON.stringify({
        data,
        expiresAt: Date.now() + ttlMs,
      })
    );
  } catch {
  }
}

export async function cachedJsonFetch(url, { cacheKey = url, ttlMs = 60_000, init } = {}) {
  const now = Date.now();
  const memoryEntry = memoryCache.get(cacheKey);

  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.data;
  }

  const sessionData = readSessionCache(cacheKey);
  if (sessionData) {
    memoryCache.set(cacheKey, { data: sessionData, expiresAt: now + ttlMs });
    return sessionData;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = fetch(url, init).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    memoryCache.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
    writeSessionCache(cacheKey, data, ttlMs);
    pendingRequests.delete(cacheKey);
    return data;
  }).catch((error) => {
    pendingRequests.delete(cacheKey);
    throw error;
  });

  pendingRequests.set(cacheKey, request);
  return request;
}

export function invalidateClientCache(prefix) {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}
