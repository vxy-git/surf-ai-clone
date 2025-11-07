/**
 * 消耗使用额度 API
 * POST /api/usage/consume - 消耗一次使用额度
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PAYMENT_CONFIG } from '@/config/payment-config';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * POST /api/usage/consume
 * Body: { walletAddress: string }
 * 消耗一次使用额度 (优先使用免费额度,然后使用付费额度)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址' },
        { status: 400 }
      );
    }

    // 标准化钱包地址
    const normalizedAddress = walletAddress.toLowerCase();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: { usage: true }
    });

    if (!user || !user.usage) {
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在,请先获取额度信息'
        },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: '额度已用完,请购买额度',
          needPayment: true
        },
        { status: 403 }
      );
    }

    // 使用事务来确保原子性操作
    const result = await prisma.$transaction(async (tx) => {
      // 重新获取最新数据 (避免并发问题)
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

        // 如果需要重置,同时更新重置时间
        if (daysSinceReset >= PAYMENT_CONFIG.FREE_TIER_RESET_DAYS) {
          updateData.freeUsage = 1; // 重置后使用第一次
          updateData.lastFreeReset = new Date();
        }
      } else {
        // 使用付费额度
        if (latestUsage.paidCredits <= 0) {
          throw new Error('付费额度不足');
        }
        updateData.paidCredits = latestUsage.paidCredits - 1;
      }

      // 更新额度
      const updatedUsage = await tx.userUsage.update({
        where: { userId: user.id },
        data: updateData
      });

      return updatedUsage;
    });

    return NextResponse.json({
      success: true,
      freeUsage: result.freeUsage,
      paidCredits: result.paidCredits,
      message: hasFreeTier ? '使用免费额度' : '使用付费额度'
    });

  } catch (error) {
    console.error('消耗额度失败:', error);

    if (error instanceof Error && error.message === '付费额度不足') {
      return NextResponse.json(
        {
          success: false,
          error: '额度不足',
          needPayment: true
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
