'use client';

import { useLanguagePair } from './use-language';
import { useStreamCommand } from './use-stream';

export const useToolsFunctions = () => {
  const { languagePair, setLanguagePair, resetLanguagePair } = useLanguagePair();
  const { executeCommand } = useStreamCommand();

  const NOTE_TRANSCRIPT_REQUEST = () => {
    executeCommand('CMD::NOTE_TRANSCRIPT_REQUEST'); // Don't await
    return { success: true };
  };
  const NOTE_PRESCRIPTION_REQUEST = ({ prescriptionRequestDetails }: { prescriptionRequestDetails: string }) => {
    executeCommand(`CMD::NOTE_PRESCRIPTION_REQUEST::${prescriptionRequestDetails}`); // Don't await
    return { success: true };
  };

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
    NOTE_TRANSCRIPT_REQUEST,
    NOTE_PRESCRIPTION_REQUEST,
  };
};
