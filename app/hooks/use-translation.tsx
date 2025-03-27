'use client';

import { Conversation, StreamMessage } from '@types';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

/**
 * Context for managing translation state throughout the application
 */
interface TranslationContextType {
  /** Forwards a conversation message to the translation service */
  forwardMessage: (message: Conversation) => Promise<void>;
  /** All translations received from the translation service */
  translations: StreamMessage[];
  /** Clears all existing translations */
  clearTranslations: () => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

/**
 * Provides translation functionality across components
 */
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [translations, setTranslations] = useState<StreamMessage[]>([]);
  const processedMessages = useRef<Set<string>>(new Set());
  /**
   * Sends a conversation message to the translation API and updates state
   * Uses the mapReduce pattern by sending/retrieving data and reducing to UI state
   */
  const forwardMessage = useCallback(async (message: Conversation) => {
    // Skip non-final messages to prevent duplicate translations
    if ((!message.isFinal && message.role === 'user') || processedMessages.current.has(message.timestamp)) return;
    processedMessages.current.add(message.timestamp);
    try {
      // Forward the message to the translation API
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: message.text,
          originalMessage: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to translate: ${response.status}`);
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      if (!reader) return;

      // Buffer for accumulated text
      let buffer = '';
      const decoder = new TextDecoder();

      // Process the stream in chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode this chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete events in buffer
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep the last incomplete event

        // Process each complete event
        events.forEach(event => {
          if (event.startsWith('data: ')) {
            try {
              // Extract and parse the JSON data
              const data = JSON.parse(event.slice(6)) as StreamMessage;

              // Add the message to our translations state
              setTranslations(prev => [...prev, data]);
            } catch {
              // Skip ping events or parse errors
              if (!event.includes(': ping')) {
                console.warn('Failed to parse event:', event);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Add error to translations for visibility
      setTranslations(prev => [
        ...prev,
        {
          type: 'error',
          content: error instanceof Error ? error.message : 'Unknown translation error',
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  const clearTranslations = useCallback(() => {
    setTranslations([]);
  }, []);

  // Define the context value with TypeScript 5 satisfies operator
  const value = {
    forwardMessage,
    translations,
    clearTranslations,
  } satisfies TranslationContextType;

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

/**
 * Hook to access translation context throughout the application
 * @throws Error if used outside of TranslationProvider
 */
export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (context === null) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
