/**
 * 单个关注项操作 API
 * PATCH /api/watchlist/[id] - 更新关注项
 * DELETE /api/watchlist/[id] - 删除关注项
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/watchlist/[id]?walletAddress=xxx
 * Body: { notes?: string, status?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const body = await request.json();
    const { notes, status } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址参数' },
        { status: 400 }
      );
    }

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: '无效的项目ID' },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 更新关注项
    const updatedItem = await prisma.watchlist.update({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId
        }
      },
      data: {
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status })
      }
    });

    // 转换为前端格式
    const formattedItem = {
      id: updatedItem.projectId,
      name: updatedItem.name,
      logo: updatedItem.logo,
      ticker: updatedItem.ticker,
      fdv: updatedItem.fdv,
      notes: updatedItem.notes,
      status: updatedItem.status,
      addedDate: updatedItem.addedDate.toISOString()
    };

    return NextResponse.json(formattedItem);

  } catch (error: any) {
    console.error('更新关注项失败:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '关注项不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/watchlist/[id]?walletAddress=xxx
 * 删除关注项
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址参数' },
        { status: 400 }
      );
    }

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: '无效的项目ID' },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 删除关注项
    await prisma.watchlist.delete({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId
        }
      }
    });

    return NextResponse.json(
      { success: true, message: '已从关注列表中移除' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('删除关注项失败:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '关注项不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
