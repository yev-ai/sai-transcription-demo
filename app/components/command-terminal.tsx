/* eslint-disable */
'use client';

import { useStreamCommand } from '@/hooks/use-stream';
import { useTranslation } from '@/hooks/use-translation';
import { StreamMessage } from '@types';
import { useMemo, useState } from 'react';

const shouldDisplayMessage = (message: StreamMessage): boolean => {
  // Only apply content-based filtering to system messages
  if (message.type === 'system') {
    const content = message.content?.toLowerCase() ?? '';

    // Define patterns that indicate non-essential system notifications
    // These exact substrings indicate messages that add noise rather than value
    const filteredPatterns = [
      'translation complete',
      'processing complete',
      'processing message', // Will match "Processing message:" due to case insensitivity
      'connection remains',
      'network error',
    ] as const;

    // Use the array's detection capability to determine visibility
    // A message is hidden if ANY pattern matches its content
    return !filteredPatterns.some(pattern => content.includes(pattern));
  }

  // Non-system messages are always displayed
  return true;
};

// 4:30pm now ...running extremely low on time.
const deduplicateMessages = (messages: StreamMessage[]): StreamMessage[] => {
  // Track seen content by type for deduplication
  const seenContent = new Map<string, Set<string>>();

  return messages.reduceRight<StreamMessage[]>((unique, message) => {
    // Create a type-specific key to allow same content in different types
    const messageType = message.type;

    // Initialize set for this type if it doesn't exist
    if (!seenContent.has(messageType)) {
      seenContent.set(messageType, new Set());
    }

    const contentSet = seenContent.get(messageType)!;
    const content = message.content;

    // Only add message if we haven't seen this content for this type
    if (content && !contentSet.has(content)) {
      contentSet.add(content);
      // Add to front to maintain chronological order after reduceRight
      return [message, ...unique];
    }

    return unique;
  }, []);
};

export function CommandTerminal() {
  const [commandInput, setCommandInput] = useState('');
  const { messages, isStreaming, executeCommand, abortStream } = useStreamCommand({
    onMessage: msg => {
      // console.log('Stream message received:', msg);
    },
  });

  const { translations, forwardMessage } = useTranslation();

  // Process messages for display with memoization for performance
  const displayMessages = useMemo(() => {
    // Choose which messages to display, preferring direct stream messages but falling back to translations
    const rawMessages = messages.length > 0 ? messages : translations;

    // First filter unwanted system messages
    const filtered = rawMessages.filter(shouldDisplayMessage);

    // Then deduplicate by content
    return deduplicateMessages(filtered);
  }, [messages, translations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isStreaming) return;

    // Forward to translation system
    await forwardMessage({
      id: crypto.randomUUID(),
      role: 'user',
      text: commandInput,
      timestamp: new Date().toISOString(),
      isFinal: true,
      status: 'final',
    });

    setCommandInput('');
  };

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden shadow-md mt-8">
      <div className="bg-gray-100 p-3 border-b">
        <h2 className="text-lg font-medium">Translation Terminal</h2>
        <p className="text-sm text-gray-600">Messages are translated here</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {displayMessages.length > 0 ? (
          displayMessages.map((msg, i) => (
            <div
              key={msg.id ?? i}
              className={`p-3 rounded ${
                msg.type === 'user'
                  ? 'bg-blue-100 ml-8'
                  : msg.type === 'assistant'
                  ? 'bg-green-100 mr-8'
                  : msg.type === 'system'
                  ? 'bg-gray-100 text-gray-600 text-sm'
                  : 'bg-red-100'
              }`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-10">Waiting for messages to translate...</div>
        )}
      </div>
      {/* This was meant for forwarding server-side commands */}
      {/* <form onSubmit={handleSubmit} className="flex border-t p-3 gap-2">
        <input
          type="text"
          value={commandInput}
          onChange={e => setCommandInput(e.target.value)}
          placeholder="Type a message to translate..."
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={!commandInput.trim() || isStreaming}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </form> */}
    </div>
  );
}
