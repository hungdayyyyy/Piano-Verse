import { createClient } from 'redis';
import { config } from './environment.js';

let realClient = null;

// Fallback in-memory cache khi Redis không có
const memoryCache = new Map();

export const redisClient = {
  get: async (key) => memoryCache.get(key) ?? null,
  set: async (key, value) => {
    memoryCache.set(key, value);
  },
  setex: async (key, ttl, value) => {
    memoryCache.set(key, value);
    setTimeout(() => memoryCache.delete(key), ttl * 1000);
  },
  del: async (key) => {
    memoryCache.delete(key);
  },
};

export const connectRedis = async () => {
  try {
    realClient = createClient({
      url: config.REDIS_URL,
      password: config.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️  Redis unavailable - using in-memory cache fallback');
            return false; // ngừng retry
          }
          return Math.min(retries * 50, 500);
        },
      },
    });

    realClient.on('error', () => {}); // tắt log lỗi spam
    realClient.on('ready', () => {
      console.log('✅ Redis connected');
      // Dùng client thật khi kết nối được
      Object.assign(redisClient, {
        get: (key) => realClient.get(key),
        set: (key, value) => realClient.set(key, value),
        setex: (key, ttl, value) => realClient.setEx(key, ttl, value),
        del: (key) => realClient.del(key),
      });
    });

    await realClient.connect();
  } catch {
    console.warn('⚠️  Redis unavailable - using in-memory cache fallback');
  }
};

export const disconnectRedis = async () => {
  if (realClient) await realClient.quit().catch(() => {});
};
