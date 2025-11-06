/**
 * 支付验证 API
 * POST /api/usage/verify-payment - 验证区块链支付交易并增加额度
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUSDCPayment, isValidTxHash, isValidAddress } from '@/lib/blockchain-verifier';
import { PAYMENT_CONFIG } from '@/config/payment-config';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * POST /api/usage/verify-payment
 * Body: {
 *   walletAddress: string,
 *   txHash: string,
 *   network: "base" | "base-sepolia"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, txHash, network } = body;

    // 验证参数
    if (!walletAddress || !txHash || !network) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证格式
    if (!isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: '无效的钱包地址格式' },
        { status: 400 }
      );
    }

    if (!isValidTxHash(txHash)) {
      return NextResponse.json(
        { error: '无效的交易哈希格式' },
        { status: 400 }
      );
    }

    if (network !== 'base' && network !== 'base-sepolia') {
      return NextResponse.json(
        { error: '不支持的网络' },
        { status: 400 }
      );
    }

    // 标准化地址
    const normalizedAddress = walletAddress.toLowerCase();

    // 检查交易是否已被使用 (防重放攻击)
    const existingPayment = await prisma.payment.findUnique({
      where: { txHash }
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          error: '该交易已被使用,请勿重复提交'
        },
        { status: 409 }
      );
    }

    // 验证区块链交易
    console.log(`开始验证交易: ${txHash} (${network})`);
    const verification = await verifyUSDCPayment(
      txHash as `0x${string}`,
      network,
      normalizedAddress
    );

    if (!verification.valid) {
      console.error('交易验证失败:', verification.error);
      return NextResponse.json(
        {
          success: false,
          error: verification.error || '交易验证失败'
        },
        { status: 400 }
      );
    }

    console.log('交易验证成功:', verification.details);

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: { usage: true }
    });

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
        include: { usage: true }
      });
    }

    // 使用事务添加支付记录并更新额度
    const result = await prisma.$transaction(async (tx) => {
      // 再次检查交易是否被使用 (并发安全)
      const doubleCheck = await tx.payment.findUnique({
        where: { txHash }
      });

      if (doubleCheck) {
        throw new Error('DUPLICATE_TX');
      }

      // 创建支付记录
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          txHash,
          amount: PAYMENT_CONFIG.PAYMENT_PRICE,
          creditsAdded: PAYMENT_CONFIG.PAYMENT_CREDITS,
          network,
          verified: true,
          timestamp: verification.details
            ? new Date(verification.details.timestamp * 1000)
            : new Date()
        }
      });

      // 更新用户额度
      const updatedUsage = await tx.userUsage.update({
        where: { userId: user.id },
        data: {
          paidCredits: {
            increment: PAYMENT_CONFIG.PAYMENT_CREDITS
          },
          totalPurchased: {
            increment: PAYMENT_CONFIG.PAYMENT_CREDITS
          }
        }
      });

      return { payment, usage: updatedUsage };
    });

    console.log('支付验证完成,已添加额度:', result.usage.paidCredits);

    return NextResponse.json({
      success: true,
      message: '支付验证成功',
      creditsAdded: PAYMENT_CONFIG.PAYMENT_CREDITS,
      paidCredits: result.usage.paidCredits,
      totalPurchased: result.usage.totalPurchased,
      payment: {
        txHash: result.payment.txHash,
        amount: result.payment.amount,
        network: result.payment.network,
        timestamp: result.payment.timestamp.getTime()
      }
    });

  } catch (error) {
    console.error('支付验证失败:', error);

    if (error instanceof Error && error.message === 'DUPLICATE_TX') {
      return NextResponse.json(
        {
          success: false,
          error: '该交易已被使用'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
