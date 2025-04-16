import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { xai } from '@ai-sdk/xai';
const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
});
export const myProvider = customProvider({
  languageModels: {
    'chat-model': groq('llama-3.3-70b-versatile'),
    'chat-model-reasoning': wrapLanguageModel({
      model: groq('deepseek-r1-distill-llama-70b'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': groq('llama-3.1-8b-instant'),
    'artifact-model': groq('llama-3.3-70b-versatile'),
  },
  imageModels: {
    'small-model': xai.image('grok-2-image'),
  },
});
