// lib/cache.js - Simple in-memory cache para health data
const cache = new Map();

export function getCached(key, ttlMs = 5000) {
    const cached = cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttlMs;
    if (isExpired) {
        cache.delete(key);
        return null;
    }

    return cached.data;
}

export function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

export function clearCache(key) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}
