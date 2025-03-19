import { auth } from '@/lib/auth';
import { StreamMessage } from '@types';
import { NextRequest, NextResponse } from 'next/server';

const PING_INTERVAL = 15000; // 15sec because of our infra keepalive

/** Store for tracking conversation history across sessions */
const commandStore = new Map<string, StreamMessage[]>();

/**
 * Process a command and stream responses with translation capabilities
 *
 * @param goal - Text or message to translate/process
 * @param onDataCallback - Function to send data back to client
 * @param userIdentifier - User ID for tracking and billing
 * @param originalMessage - Optional original message object for context
 */
async function executeCommandWithStreaming(
  goal: string,
  onDataCallback: (data: StreamMessage) => void,
  userIdentifier: string,
  // eslint-disable-next-line
  originalMessage?: Record<string, any>
): Promise<void> {
  // Generate deterministic session ID for conversation tracking
  const sessionId = `${userIdentifier}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Collect messages for this session for potential retrieval later
  const messages: StreamMessage[] = [];

  /**
   * Helper to format, store, and emit messages in a single operation
   */
  const sendMessage = (message: Omit<StreamMessage, 'timestamp'>) => {
    const fullMessage = {
      ...message,
      timestamp: Date.now(),
    } satisfies StreamMessage;

    messages.push(fullMessage);
    onDataCallback(fullMessage);
    return fullMessage;
  };

  try {
    // Acknowledge we received the message and are processing it
    sendMessage({
      type: 'system',
      content: `Processing message: ${goal.substring(0, 50)}${goal.length > 50 ? '...' : ''}`,
    });

    // Brief delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 300));

    // If we have an original message, reflect it as a "translated" version
    if (originalMessage) {
      const role = originalMessage.role ?? 'user';

      sendMessage({
        type: role === 'user' ? 'user' : 'assistant',
        content: `[Translated] ${originalMessage.text ?? goal}`,
      });

      // Simulated translation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add a follow-up "translation complete" message
      sendMessage({
        type: 'system',
        content: 'Translation complete',
      });

      // Store this conversation thread for potential retrieval
      commandStore.set(sessionId, [...messages]);
      return;
    }

    // Regular command processing for non-translation requests
    // Using the mapReduce pattern to process responses sequentially
    const responses = [
      'Received your message for processing...',
      'Analyzing content...',
      'Generating translation...',
      `Completed processing: "${goal.substring(0, 30)}${goal.length > 30 ? '...' : ''}"`,
    ];

    await responses.reduce(async (promise, content) => {
      await promise; // Wait for previous message
      await new Promise(resolve => setTimeout(resolve, 800)); // Delay between messages

      // Send next message in sequence
      sendMessage({ type: 'assistant', content });
    }, Promise.resolve());

    // Store conversation for later retrieval
    commandStore.set(sessionId, [...messages]);
  } catch (error) {
    // Safely handle and report errors
    sendMessage({
      type: 'error',
      content: error instanceof Error ? `Error: ${error.message}` : 'Unknown error occurred during translation',
    });
  }
}

/**
 * Stream API endpoint for receiving messages and streaming translated responses
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goal, originalMessage } = body;

    // Ensure we have a goal to process
    if (!goal) {
      return NextResponse.json({ error: 'Missing required field: goal' }, { status: 400 });
    }

    // Using modern TypeScript for safe type usage
    let pingInterval: ReturnType<typeof setInterval>;
    let isConnected = true; // Track connection status for cleanup

    const stream = new ReadableStream({
      async start(controller) {
        // Keep connection alive with periodic pings
        pingInterval = setInterval(() => {
          if (isConnected) {
            controller.enqueue(new TextEncoder().encode(': ping\n\n'));
          }
        }, PING_INTERVAL);

        // Process the command and stream responses
        await executeCommandWithStreaming(
          goal,
          data => {
            // Only send if connection is still active
            if (isConnected) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          },
          // Use nullish coalescing for safer fallbacks
          session?.user?.email ?? process.env.BILL_API_CALLS_TO ?? 'default',
          originalMessage
        );

        // Cleanup when done, but keep connection open for potential future messages
        if (isConnected) {
          clearInterval(pingInterval);

          // Signal completion but don't close the stream yet
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'system',
                content: 'Processing complete, connection remains open for more messages',
                timestamp: Date.now(),
              })}\n\n`
            )
          );

          // The stream stays open for further interaction
          // This enables continuous back-and-forth without reconnecting
        }
      },
      cancel() {
        // Client disconnected, clean up resources
        isConnected = false;
        clearInterval(pingInterval);
      },
    });

    // Return the stream with appropriate headers for SSE
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in server-side stream processing:', error);
    return NextResponse.json({ error: 'Error in server-side stream processing' }, { status: 500 });
  }
}
