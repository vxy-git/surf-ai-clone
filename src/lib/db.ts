/**
 * Prisma Client 单例
 * 确保在开发环境中不会创建多个数据库连接实例
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// 测试数据库连接并处理错误
prisma.$connect()
  .then(() => {
    console.log('[Database] Successfully connected to PostgreSQL');
  })
  .catch((err) => {
    console.error('[Database] Failed to connect to PostgreSQL:', err);
    console.error('[Database] Connection details:', {
      hasUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      error: err.message,
    });
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
