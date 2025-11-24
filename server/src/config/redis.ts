import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  await redisClient.connect();
  return redisClient;
}

export function getRedis() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}
