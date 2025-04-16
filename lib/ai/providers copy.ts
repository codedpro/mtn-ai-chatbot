import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createXai } from '@ai-sdk/xai';

const xaiPro = createXai({
  baseURL: 'http://10.223.188.42:3001/process_message',
  headers: { stream: 'true' },
});
const xaiNoob = createXai({
  baseURL: 'http://10.223.188.42:3001/process_message',
});
export const myProvider = customProvider({
  languageModels: {
    'chat-model': xaiPro('grok-2-1212', { simulateStreaming: false }),
    'chat-model-reasoning': wrapLanguageModel({
      model: xaiPro('grok-3-mini-beta', { simulateStreaming: false }),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': xaiNoob('grok-2-1212', { simulateStreaming: true }),
    'artifact-model': xaiPro('grok-2-1212', { simulateStreaming: false }),
  },
  imageModels: {
    'small-model': xaiPro.image('grok-2-image'),
  },
});
