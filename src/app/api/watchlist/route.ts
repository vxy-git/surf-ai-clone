/**
 * 关注列表 API
 * GET /api/watchlist - 获取用户关注列表
 * POST /api/watchlist - 添加项目到关注列表
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/watchlist?walletAddress=xxx
 * 获取用户的关注列表
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

    const normalizedAddress = walletAddress.toLowerCase();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress }
    });

    if (!user) {
      // 用户不存在,返回空数组
      return NextResponse.json([]);
    }

    // 获取关注列表
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: user.id },
      orderBy: { addedDate: 'desc' }
    });

    // 转换为前端格式
    const formattedWatchlist = watchlist.map(item => ({
      id: item.projectId,
      name: item.name,
      logo: item.logo,
      ticker: item.ticker,
      fdv: item.fdv,
      notes: item.notes,
      status: item.status,
      addedDate: item.addedDate.toISOString()
    }));

    return NextResponse.json(formattedWatchlist);

  } catch (error) {
    console.error('获取关注列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist
 * Body: {
 *   walletAddress: string,
 *   projectId: number,
 *   name: string,
 *   logo: string,
 *   ticker: string,
 *   fdv: string,
 *   notes?: string,
 *   status?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      projectId,
      name,
      logo,
      ticker,
      fdv,
      notes = '',
      status = ''
    } = body;

    if (!walletAddress || !projectId || !name) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress }
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
        }
      });
    }

    // 检查是否已存在
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: '该项目已在关注列表中' },
        { status: 409 }
      );
    }

    // 添加到关注列表
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: user.id,
        projectId,
        name,
        logo,
        ticker,
        fdv,
        notes,
        status
      }
    });

    // 转换为前端格式
    const formattedItem = {
      id: watchlistItem.projectId,
      name: watchlistItem.name,
      logo: watchlistItem.logo,
      ticker: watchlistItem.ticker,
      fdv: watchlistItem.fdv,
      notes: watchlistItem.notes,
      status: watchlistItem.status,
      addedDate: watchlistItem.addedDate.toISOString()
    };

    return NextResponse.json(formattedItem, { status: 201 });

  } catch (error) {
    console.error('添加关注失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
