// ============================================================
// 缓存层 - 内存 + localStorage，带 TTL 过期
// ============================================================

const CACHE_TTL = 5 * 60 * 1000; // 5 分钟
const memoryCache = new Map();

function formatKey(userId, key) {
  return `campus_cache_${userId}_${key}`;
}

/**
 * 读取缓存：内存优先 → localStorage → 无则返回 null
 */
export function getCached(userId, key) {
  if (!userId) return null;
  const fullKey = formatKey(userId, key);

  // 1. 内存缓存（最快）
  const memEntry = memoryCache.get(fullKey);
  if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL) {
    return memEntry.data;
  }
  if (memEntry) memoryCache.delete(fullKey); // 过期清理

  // 2. localStorage
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL) {
      // 提升到内存
      memoryCache.set(fullKey, { data, timestamp });
      return data;
    }
    // 过期清理
    localStorage.removeItem(fullKey);
  } catch {
    // 解析失败，清理
    try { localStorage.removeItem(fullKey); } catch {}
  }

  return null;
}

/**
 * 写入缓存：同时写内存和 localStorage
 */
export function setCached(userId, key, data) {
  if (!userId || data === undefined) return;
  const fullKey = formatKey(userId, key);
  const entry = { data, timestamp: Date.now() };

  // 内存
  memoryCache.set(fullKey, entry);

  // localStorage（静默处理 quota 超限）
  try {
    localStorage.setItem(fullKey, JSON.stringify(entry));
  } catch {
    // 可能 localStorage 满了，内存缓存仍然有效
  }
}

/**
 * 清除某个用户的所有缓存（登出时调用）
 */
export function clearUserCache(userId) {
  if (!userId) return;
  const prefix = formatKey(userId, "");

  // 内存
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }

  // localStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // 静默处理
  }
}

/**
 * 清除单个缓存条目（数据变更时精准失效）
 */
export function removeCached(userId, key) {
  if (!userId) return;
  const fullKey = formatKey(userId, key);
  memoryCache.delete(fullKey);
  try { localStorage.removeItem(fullKey); } catch {}
}
