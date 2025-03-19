'use client';

import { useLanguagePair } from './use-language';

export const useToolsFunctions = () => {
  const { languagePair, setLanguagePair, resetLanguagePair } = useLanguagePair();

  const SEND_TRANSCRIPT = () => `Implement server-side action.`;
  const SEND_PRESCRIPTION = () => `Implement server-side action.`;

  const SET_LANGUAGES = (params: {
    userALanguage: string;
    userBLanguage: string;
  }): { success: boolean; userALanguage: string; userBLanguage: string } => {
    setLanguagePair(params.userALanguage, params.userBLanguage);

    return {
      success: true,
      userALanguage: params.userALanguage,
      userBLanguage: params.userBLanguage,
    };
  };

  const REMIND_LANGUAGES = (): {
    userALanguage: string;
    userBLanguage: string;
    success: boolean;
  } => {
    return { ...languagePair, success: true };
  };

  const RESET_LANGUAGES = (): { success: boolean } => {
    resetLanguagePair();

    return { success: true };
  };

  return {
    SET_LANGUAGES,
    REMIND_LANGUAGES,
    RESET_LANGUAGES,
    SEND_TRANSCRIPT,
    SEND_PRESCRIPTION,
  };
};
