/**
 * 单个会话操作 API
 * PATCH /api/sessions/[id] - 更新会话
 * DELETE /api/sessions/[id] - 删除会话
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/sessions/[id]
 * Body: {
 *   title?: string,
 *   messages?: Array<{ role: string, content: string }>
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { title, messages } = body;

    // 检查会话是否存在
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    // 使用事务更新会话
    const updatedSession = await prisma.$transaction(async (tx) => {
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
          data: messages.map((msg: any) => ({
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
    });

    if (!updatedSession) {
      throw new Error('更新失败');
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

    return NextResponse.json(formattedSession);

  } catch (error) {
    console.error('更新会话失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
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
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // 检查会话是否存在
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    // 删除会话 (级联删除消息)
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json(
      { success: true, message: '会话已删除' },
      { status: 200 }
    );

  } catch (error) {
    console.error('删除会话失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
