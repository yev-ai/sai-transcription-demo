export type StreamMessage = {
  id?: string;
  content: string;
  type: 'assistant' | 'user' | 'system' | 'error';
  timestamp: number;
};
