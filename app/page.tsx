'use client';

import { BroadcastButton } from '@/components/broadcast-button';
import { TextInput } from '@/components/text-input';
import { useToolsFunctions } from '@/hooks/use-tools';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { tools } from '@/lib/tools';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { MessageControls } from './components/message-controls';
import styles from './page.module.css';

const App: React.FC = () => {
  const { status: authStatus } = useSession();
  const isLoggedIn = authStatus === 'authenticated';

  const { status, isSessionActive, registerFunction, handleStartStopClick, msgs, conversation, sendTextMessage } = useWebRTCAudioSession(
    'ash',
    tools
  );

  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        SET_LANGUAGES: 'SET_LANGUAGES',
        REMIND_LANGUAGES: 'REMIND_LANGUAGES',
        RESET_LANGUAGES: 'RESET_LANGUAGES',
      };

      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions]);

  return isLoggedIn ? (
    <div className={styles.app}>
      <div className="flex flex-col items-center gap-4">
        <BroadcastButton isSessionActive={isSessionActive} onClick={handleStartStopClick} />
        {status && (
          <div>
            <MessageControls conversation={conversation} msgs={msgs} />
            <TextInput onSubmit={sendTextMessage} disabled={!isSessionActive} />
          </div>
        )}
      </div>
    </div>
  ) : (
    <div> Please Log In </div>
  );
};

export default App;
