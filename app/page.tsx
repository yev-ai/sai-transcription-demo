'use client';

import { BroadcastButton } from '@/components/broadcast-button';
import { TextInput } from '@/components/text-input';
import { useToolsFunctions } from '@/hooks/use-tools';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { tools } from '@/lib/tools';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { CommandTerminal } from './components/command-terminal';
import { MessageControls } from './components/message-controls';
import { TranslationProvider, useTranslation } from './hooks/use-translation';
import styles from './page.module.css';
const ConversationWithTranslation: React.FC = () => {
  const { status, isSessionActive, registerFunction, handleStartStopClick, msgs, conversation, sendTextMessage } = useWebRTCAudioSession(
    'ash',
    tools
  );

  const toolsFunctions = useToolsFunctions();
  const { forwardMessage } = useTranslation();

  // Register function tools for LLM to use
  useEffect(() => {
    const functionNames = {
      SET_LANGUAGES: 'SET_LANGUAGES',
      REMIND_LANGUAGES: 'REMIND_LANGUAGES',
      RESET_LANGUAGES: 'RESET_LANGUAGES',
      NOTE_TRANSCRIPT_REQUEST: 'NOTE_TRANSCRIPT_REQUEST',
      NOTE_PRESCRIPTION_REQUEST: 'NOTE_PRESCRIPTION_REQUEST',
    } as const;

    // Map over tool functions to register each with WebRTC session
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionName = functionNames[name as keyof typeof functionNames];
      if (functionName) registerFunction(functionName, func);
    });
  }, [registerFunction, toolsFunctions]);

  // Forward final messages to translation service
  useEffect(() => {
    conversation.filter(msg => msg.isFinal === true).forEach(forwardMessage);
  }, [conversation, forwardMessage]);

  return (
    <div className="flex flex-col items-center gap-4">
      <BroadcastButton isSessionActive={isSessionActive} onClick={handleStartStopClick} />
      {status && (
        <div className="w-full max-w-2xl">
          <MessageControls conversation={conversation} msgs={msgs} />
          <TextInput onSubmit={sendTextMessage} disabled={!isSessionActive} />
        </div>
      )}
    </div>
  );
};
const App: React.FC = () => {
  const { status: authStatus } = useSession();
  const isLoggedIn = authStatus === 'authenticated';

  if (!isLoggedIn) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium">Please log in to access the application</p>
      </div>
    );
  }

  return (
    <TranslationProvider>
      <div className={styles.app}>
        <div className="mt-8 w-full max-w-2xl">
          <ConversationWithTranslation />
          <CommandTerminal />
        </div>
      </div>
    </TranslationProvider>
  );
};

export default App;
