interface Tool {
  type: 'function';
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description: string;
      }
    >;
  };
}

const toolDefinitions = {
  SET_LANGUAGES: {
    description:
      'Sets the language pair for the session. Provide the detected languages for User A and User B as ISO 639-1 codes ' +
      "(e.g., 'en' for English, 'es' for Spanish). This tool call immediately updates the internal state with the " +
      'languages to be used for translation.',
    parameters: {
      type: 'object',
      properties: {
        userALanguage: {
          type: 'string',
          description: "The ISO 639-1 language code for User A's spoken language.",
        },
        userBLanguage: {
          type: 'string',
          description: "The ISO 639-1 language code for User B's spoken language.",
        },
      },
      required: ['userALanguage', 'userBLanguage'],
      additionalProperties: false,
    },
  },
  REMIND_LANGUAGES: {
    description:
      "Retrieves the current language pair configuration from the system as ISO 639-1 codes (e.g., 'en' for English, 'es' for " +
      'Spanish). Use this tool if you become uncertain about the translation languages, to silently refresh your internal state. ' +
      "This tool returns an object with the keys 'userALanguage' and 'userBLanguage'.",
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  RESET_LANGUAGES: {
    description:
      'Clears the current language pair configuration, forcing a reset of the language detection process. This tool should be called ' +
      "immediately when the key phrase 'cortex control reset languages' is detected.",
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
} as const;

const tools: Tool[] = Object.entries(toolDefinitions).map(([name, config]) => ({
  type: 'function',
  name,
  description: config.description,
  parameters: config.parameters,
}));

export { tools };
export type { Tool };
