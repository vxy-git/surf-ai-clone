/**
 * 聊天会话 API
 * GET /api/sessions - 获取用户所有会话
 * POST /api/sessions - 创建新会话
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sessions?walletAddress=xxx
 * 获取用户所有聊天会话
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

    // 获取所有会话及消息
    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 转换为前端格式
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      mode: session.mode as 'ask' | 'research',
      messages: session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString()
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedSessions);

  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 * Body: {
 *   walletAddress: string,
 *   title: string,
 *   mode: 'ask' | 'research',
 *   messages: Array<{ role: string, content: string }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, title, mode, messages = [] } = body;

    if (!walletAddress || !title || !mode) {
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

    // 创建会话及消息
    const session = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title,
        mode,
        messages: {
          create: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // 转换为前端格式
    const formattedSession = {
      id: session.id,
      title: session.title,
      mode: session.mode as 'ask' | 'research',
      messages: session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString()
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString()
    };

    return NextResponse.json(formattedSession, { status: 201 });

  } catch (error) {
    console.error('创建会话失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
