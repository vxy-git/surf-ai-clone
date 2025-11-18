/**
 * 单个会话操作 API
 * PATCH /api/sessions/[id] - 更新会话
 * DELETE /api/sessions/[id] - 删除会话
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 路由最大执行时间 10秒

/**
 * PATCH /api/sessions/[id]
 * Body: {
 *   title?: string,
 *   messages?: Array<{ role: string, content: string }>
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { title, messages } = body;

    // 检查会话是否存在
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session does not exist' },
        { status: 404 }
      );
    }

    // 使用事务更新会话
    const startTime = Date.now();
    const messageCount = messages?.length || 0;
    console.log(`[Sessions API] Starting transaction for session ${sessionId}, messages: ${messageCount}`);

    const updatedSession = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 更新会话标题
        const session = await tx.chatSession.update({
          where: { id: sessionId },
          data: {
            ...(title && { title }),
            updatedAt: new Date()
          }
        });

        // 如果提供了消息,先删除旧消息再创建新消息
        if (messages && Array.isArray(messages)) {
          await tx.chatMessage.deleteMany({
            where: { sessionId }
          });

          await tx.chatMessage.createMany({
            data: messages.map((msg: { role: string; content: string }) => ({
              sessionId,
              role: msg.role,
              content: msg.content
            }))
          });
        }

        // 获取完整会话数据
        return await tx.chatSession.findUnique({
          where: { id: sessionId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        });
      },
      {
        maxWait: 10000, // 等待事务开始的最大时间 10秒
        timeout: 20000, // 事务执行的最大时间 20秒 (Prisma 默认 5秒)
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[Sessions API] Transaction completed in ${duration}ms for session ${sessionId}`);

    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    // 转换为前端格式
    const formattedSession = {
      id: updatedSession.id,
      title: updatedSession.title,
      mode: updatedSession.mode as 'ask' | 'research',
      messages: updatedSession.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString()
      })),
      createdAt: updatedSession.createdAt.toISOString(),
      updatedAt: updatedSession.updatedAt.toISOString()
    };

    return NextResponse.json({ session: formattedSession });

  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[id]
 * 删除会话及其所有消息
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // 检查会话是否存在
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session does not exist' },
        { status: 404 }
      );
    }

    // 删除会话 (级联删除消息)
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json(
      { success: true, message: 'Session has been deleted' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
