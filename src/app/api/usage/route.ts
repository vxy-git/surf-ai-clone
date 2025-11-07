/**
 * 使用额度 API
 * GET /api/usage - 获取用户使用额度数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PAYMENT_CONFIG } from '@/config/payment-config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/usage?walletAddress=xxx
 * 获取用户的使用额度数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址参数' },
        { status: 400 }
      );
    }

    // 标准化钱包地址 (小写)
    const normalizedAddress = walletAddress.toLowerCase();

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: {
        usage: true,
        payments: {
          where: { verified: true },
          orderBy: { timestamp: 'desc' },
          take: 10 // 只返回最近 10 条支付记录
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
          payments: true
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

      // 重新获取用户数据
      const updatedUser = await prisma.user.findUnique({
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
      if (updatedUser) {
        user = updatedUser;
      }
    }

    // 确保 usage 存在
    if (!user.usage) {
      throw new Error('用户额度记录不存在');
    }

    // 检查是否需要重置免费额度 (30天周期)
    const daysSinceReset = Math.floor(
      (Date.now() - user.usage.lastFreeReset.getTime()) / (1000 * 60 * 60 * 24)
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

      // 更新内存中的数据
      user.usage!.freeUsage = 0;
      user.usage!.lastFreeReset = new Date();
    }

    // 构造响应数据 (兼容现有类型)
    const responseData = {
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

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('获取使用额度失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
