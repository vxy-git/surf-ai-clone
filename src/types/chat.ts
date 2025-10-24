import type { Message } from 'ai/react';

export interface ChatSession {
  id: string;
  title: string;
  mode: 'ask' | 'research';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export type ChatMode = 'ask' | 'research';
