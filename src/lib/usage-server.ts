/**
 * 服务端使用额度管理模块
 * Server-side Usage Management Module
 *
 * 用于服务端 API 路由直接操作数据库,避免 HTTP fetch 调用
 */

import { prisma } from '@/lib/db';
import { PAYMENT_CONFIG } from '@/config/payment-config';
import type { UsageData, UsageCheckResult } from '@/types/usage';

/**
 * 服务端获取使用数据(直接查询数据库)
 */
export async function getUsageDataServer(walletAddress: string): Promise<UsageData> {
  const normalizedAddress = walletAddress.toLowerCase();

  // 查找或创建用户
  let user = await prisma.user.findUnique({
    where: { walletAddress: normalizedAddress },
    include: {
      usage: true,
      payments: {
        where: { verified: true },
        orderBy: { timestamp: 'desc' },
        take: 10
      }
    }
  });

  // 如果用户不存在,创建新用户
  if (!user) {
    user = await prisma.user.create({
      data: {
        walletAddress: normalizedAddress,
        usage: {
          create: {
            freeUsage: 0,
            paidCredits: 0,
            totalPurchased: 0,
            lastFreeReset: new Date()
          }
        }
      },
      include: {
        usage: true,
        payments: {
          where: { verified: true },
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });
  }

  // 如果用户存在但没有 usage 记录,创建一个
  if (!user.usage) {
    await prisma.userUsage.create({
      data: {
        userId: user.id,
        freeUsage: 0,
        paidCredits: 0,
        totalPurchased: 0,
        lastFreeReset: new Date()
      }
    });

    // 重新获取
    user = (await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: {
        usage: true,
        payments: {
          where: { verified: true },
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    }))!;
  }

  // 检查是否需要重置免费额度
  const daysSinceReset = Math.floor(
    (Date.now() - user.usage!.lastFreeReset.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceReset >= PAYMENT_CONFIG.FREE_TIER_RESET_DAYS) {
    // 重置免费额度
    await prisma.userUsage.update({
      where: { userId: user.id },
      data: {
        freeUsage: 0,
        lastFreeReset: new Date()
      }
    });
    user.usage!.freeUsage = 0;
    user.usage!.lastFreeReset = new Date();
  }

  // 构造响应数据
  return {
    walletAddress: user.walletAddress,
    freeUsage: user.usage!.freeUsage,
    paidCredits: user.usage!.paidCredits,
    lastFreeReset: user.usage!.lastFreeReset.getTime(),
    totalPurchased: user.usage!.totalPurchased,
    paymentHistory: user.payments.map(payment => ({
      txHash: payment.txHash,
      amount: payment.amount,
      creditsAdded: payment.creditsAdded,
      timestamp: payment.timestamp.getTime(),
      network: payment.network
    }))
  };
}

/**
 * 服务端检查是否可以使用 API
 */
export async function canUseAPIServer(walletAddress: string): Promise<UsageCheckResult> {
  const data = await getUsageDataServer(walletAddress);

  const freeRemaining = Math.max(0, PAYMENT_CONFIG.FREE_TIER_LIMIT - data.freeUsage);
  const paidRemaining = data.paidCredits;

  // 还有免费次数
  if (freeRemaining > 0) {
    return {
      canUse: true,
      needPayment: false,
      freeRemaining,
      paidRemaining,
      message: `还有 ${freeRemaining} 次免费使用`
    };
  }

  // 还有付费次数
  if (paidRemaining > 0) {
    return {
      canUse: true,
      needPayment: false,
      freeRemaining: 0,
      paidRemaining,
      message: `还有 ${paidRemaining} 次付费使用`
    };
  }

  // 需要付费
  return {
    canUse: false,
    needPayment: true,
    freeRemaining: 0,
    paidRemaining: 0,
    message: `支付 ${PAYMENT_CONFIG.PAYMENT_PRICE} USDC 获得 ${PAYMENT_CONFIG.PAYMENT_CREDITS} 次使用`
  };
}

/**
 * 服务端消耗一次使用额度
 */
export async function consumeUsageServer(walletAddress: string): Promise<boolean> {
  try {
    const normalizedAddress = walletAddress.toLowerCase();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: { usage: true }
    });

    if (!user || !user.usage) {
      return false;
    }

    // 检查是否需要重置免费额度
    const daysSinceReset = Math.floor(
      (Date.now() - user.usage.lastFreeReset.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 检查是否需要重置免费额度
    const shouldReset = daysSinceReset >= PAYMENT_CONFIG.FREE_TIER_RESET_DAYS;
    const currentFreeUsage = shouldReset ? 0 : user.usage.freeUsage;
    const currentPaidCredits = user.usage.paidCredits;

    // 检查是否还有可用额度
    const freeRemaining = PAYMENT_CONFIG.FREE_TIER_LIMIT - currentFreeUsage;
    const hasFreeTier = freeRemaining > 0;
    const hasPaidCredits = currentPaidCredits > 0;

    if (!hasFreeTier && !hasPaidCredits) {
      return false;
    }

    // 使用事务更新额度
    await prisma.$transaction(async (tx) => {
      const latestUsage = await tx.userUsage.findUnique({
        where: { userId: user.id }
      });

      if (!latestUsage) {
        throw new Error('额度记录不存在');
      }

      const updateData: { freeUsage?: number; lastFreeReset?: Date; paidCredits?: number } = {};

      // 优先使用免费额度
      if (hasFreeTier) {
        updateData.freeUsage = latestUsage.freeUsage + 1;
        if (daysSinceReset >= PAYMENT_CONFIG.FREE_TIER_RESET_DAYS) {
          updateData.freeUsage = 1;
          updateData.lastFreeReset = new Date();
        }
      } else {
        // 使用付费额度
        if (latestUsage.paidCredits <= 0) {
          throw new Error('付费额度不足');
        }
        updateData.paidCredits = latestUsage.paidCredits - 1;
      }

      await tx.userUsage.update({
        where: { userId: user.id },
        data: updateData
      });
    });

    return true;
  } catch (error) {
    console.error('服务端消耗额度失败:', error);
    return false;
  }
}
