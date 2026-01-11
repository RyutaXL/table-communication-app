import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export interface TranslationRequest {
  text: string;
  targetLanguage: 'en' | 'es' | 'ja';
  context?: string;
}

export interface GenerateRequest {
  prompt: string;
  context?: string;
  action?: 'generate' | 'improve';
  language?: 'en' | 'es' | 'ja';
}

/**
 * Hook for translating text using Gemini API
 */
export function useTranslation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = async (request: TranslationRequest): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    translate,
    isLoading,
    error,
  };
}

/**
 * Hook for generating restaurant responses using Gemini API
 */
export function useGeminiResponse() {
  return useMutation({
    mutationFn: async (request: GenerateRequest): Promise<string> => {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Response generation failed');
      }

      const data = await response.json();
      return data.response;
    },
  });
}

/**
 * Hook for improving existing responses
 */
export function useImproveResponse() {
  const mutation = useGeminiResponse();

  const improve = (text: string, language: 'en' | 'es' | 'ja' = 'ja') => {
    return mutation.mutateAsync({
      prompt: text,
      action: 'improve',
      language,
    });
  };

  return {
    ...mutation,
    improve,
  };
}
