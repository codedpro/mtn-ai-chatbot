import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';
// import { xai } from '@ai-sdk/xai'; // ⟵ removed

// Initialize Groq client (ensure GROQ_API_KEY is set)
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const myProvider =  customProvider({
      languageModels: {
        // General chat / high-quality generation
        'chat-model': groq('llama-3.1-8b-instant'),

        // “Reasoning-like” path (middleware extracts <think>…</think> if present)
        // Groq doesn’t have a special reasoning stream format, but you can still
        // wrap a strong model and capture any chain-of-thought tags you emit.
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('llama-3.1-70b-versatile'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        // Fast, cheap titles
        'title-model': groq('llama-3.1-8b-instant'),

        // Artifacts / utility generations (fast path)
        'artifact-model': groq('llama-3.1-8b-instant'),
      },

      // Groq does not provide image generation models.
      // imageModels: { ... } // ⟵ removed on purpose
    });
