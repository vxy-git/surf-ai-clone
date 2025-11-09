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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const body = await request.json();
    const { notes, status } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address parameter' },
        { status: 400 }
      );
    }

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
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
        { error: 'User does not exist' },
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

  } catch (error: unknown) {
    console.error('Failed to update watchlist item:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Watchlist item does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address parameter' },
        { status: 400 }
      );
    }

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
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
        { error: 'User does not exist' },
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
      { success: true, message: 'Removed from watchlist' },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Failed to delete watchlist item:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Watchlist item does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
