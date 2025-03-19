'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Message format that matches server-side StreamMessage
 */
export type StreamMessage = {
  id?: string;
  content: string;
  type: 'assistant' | 'user' | 'system' | 'error';
  timestamp: number;
};

/**
 * Options for the streaming command hook
 */
interface UseStreamCommandOptions {
  /**
   * Auto-connect to the stream on hook initialization
   * @default false
   */
  autoConnect?: boolean;

  /**
   * Callback for each message received
   * Useful for fine-grained UI updates
   */
  onMessage?: (message: StreamMessage) => void;
}

/**
 * Hook result containing streaming state and controls
 */
interface UseStreamCommandResult {
  /** All messages received from the stream */
  messages: StreamMessage[];
  /** Whether the stream is currently active */
  isStreaming: boolean;
  /** Last error that occurred during streaming */
  error: Error | null;
  /** Current connection status */
  status: 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';
  /** Execute a command and stream the results */
  executeCommand: (task: string) => Promise<void>;
  /** Manually abort the current stream */
  abortStream: () => void;
}

/**
 * React hook for executing commands with streaming results
 * Uses SSE to receive real-time updates from the server
 */
export function useStreamCommand(options?: UseStreamCommandOptions): UseStreamCommandResult {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<UseStreamCommandResult['status']>('idle');

  // Use refs for values that shouldn't trigger re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Cleans up resources when streaming ends
   */
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Abort any pending fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsStreaming(false);
  }, []);

  /**
   * Aborts the current stream when requested by user
   */
  const abortStream = useCallback(() => {
    if (isStreaming) {
      cleanup();
      setStatus('idle');
    }
  }, [isStreaming, cleanup]);

  /**
   * Executes a command and streams the results
   */
  const executeCommand = useCallback(
    async (goal: string) => {
      // Clean up any existing stream
      cleanup();

      // Reset state for new command
      setMessages([]);
      setError(null);
      setStatus('connecting');

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Stream request failed: ${response.status} ${errorText}`);
        }

        if (!response.body) {
          throw new Error('Response has no body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        setIsStreaming(true);
        setStatus('streaming');

        // Process the stream using mapReduce pattern
        const processStreamChunks = async (): Promise<void> => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Final processing of any remaining buffer
                if (buffer.trim()) {
                  processEvents(buffer);
                }
                setStatus('completed');
                break;
              }

              // Decode chunk and add to buffer
              buffer += decoder.decode(value, { stream: true });

              // Process complete events in buffer
              processEvents(buffer);

              // Keep remainder for next iteration
              const lastEventEnd = buffer.lastIndexOf('\n\n');
              if (lastEventEnd > 0) {
                buffer = buffer.slice(lastEventEnd + 2);
              }
            }
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              // User aborted - not a real error
              return;
            }

            setError(err instanceof Error ? err : new Error(String(err)));
            setStatus('error');
          } finally {
            cleanup();
          }
        };

        /**
         * Process SSE formatted events from buffer
         */
        const processEvents = (eventBuffer: string) => {
          const events = eventBuffer.split('\n\n').filter(Boolean);

          for (const event of events) {
            if (event.startsWith('data: ')) {
              try {
                const data = JSON.parse(event.slice(6)) as StreamMessage;
                // console.log(`DATA RECEIVED`, data);

                // Update messages state using functional update for safety
                setMessages(prev => [...prev, data]);

                // Trigger optional callback
                options?.onMessage?.(data);
              } catch {
                // Skip ping events or malformed data
                if (!event.includes(': ping')) {
                  console.warn('Failed to parse event data:', event);
                }
              }
            }
          }
        };

        // Start processing the stream
        await processStreamChunks();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
        cleanup();
      }
    },
    [cleanup, options]
  );

  // Auto-connect if specified in options
  useEffect(() => {
    if (options?.autoConnect) {
      executeCommand('Initial connection');
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [options?.autoConnect, executeCommand, cleanup]);

  return {
    messages,
    isStreaming,
    error,
    status,
    executeCommand,
    abortStream,
  };
}
