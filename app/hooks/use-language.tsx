'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

interface LanguagePair {
  userALanguage: string;
  userBLanguage: string;
}

interface LanguagePairContextType {
  languagePair: LanguagePair;
  setLanguagePair: (userA: string, userB: string) => void;
  resetLanguagePair: () => void;
}

const LanguagePairContext = createContext<LanguagePairContextType>({
  languagePair: { userALanguage: '', userBLanguage: '' },
  setLanguagePair: () => {},
  resetLanguagePair: () => {},
});

export function LanguagePairProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [languagePair, setLanguagePairState] = useState<LanguagePair>({
    userALanguage: '',
    userBLanguage: '',
  });

  const setLanguagePair = useCallback((userA: string, userB: string) => {
    console.log('Setting language pair', userA, userB);
    setLanguagePairState({ userALanguage: userA, userBLanguage: userB });
  }, []);

  const resetLanguagePair = useCallback(() => {
    console.log('Resetting language pair');
    setLanguagePairState({ userALanguage: '', userBLanguage: '' });
  }, []);

  return (
    <LanguagePairContext.Provider
      value={{
        languagePair,
        setLanguagePair,
        resetLanguagePair,
      }}
    >
      {children}
    </LanguagePairContext.Provider>
  );
}

export const useLanguagePair = () => useContext(LanguagePairContext);
