import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface TranslationRequest {
  text: string;
  targetLanguage: 'en' | 'es' | 'ja';
  context?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

/**
 * Translate text using Gemini API
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const { text, targetLanguage, context } = request;

    // Create context-aware prompt
    let prompt = `Translate the following text to ${targetLanguage === 'en' ? 'English' : targetLanguage === 'es' ? 'Spanish' : 'Japanese'}: "${text}"`;

    if (context) {
      prompt += `\n\nContext: This is for restaurant staff communicating with foreign customers. ${context}`;
    }

    prompt += '\n\nPlease provide only the translated text without any additional explanations or quotes.';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return {
      translatedText,
      detectedLanguage: detectLanguage(text),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Translation failed');
  }
}

/**
 * Generate restaurant-specific responses using Gemini
 */
export async function generateRestaurantResponse(prompt: string, context?: string): Promise<string> {
  try {
    let fullPrompt = `You are a helpful restaurant staff assistant. Generate a polite, clear response for: "${prompt}"`;

    if (context) {
      fullPrompt += `\n\nContext: ${context}`;
    }

    fullPrompt += '\n\nKeep the response concise and friendly. Focus on clear communication.';

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Response generation failed');
  }
}

/**
 * Improve existing restaurant responses
 */
export async function improveResponse(text: string, language: 'en' | 'es' | 'ja' = 'ja'): Promise<string> {
  try {
    const prompt = `Improve this restaurant response to make it more polite, clear, and culturally appropriate for ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'Japanese'} speakers: "${text}"

Please provide only the improved response without quotes or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    return text; // Fallback to original text
  }
}

/**
 * Detect language from text
 */
function detectLanguage(text: string): string {
  // Simple language detection based on character sets
  if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(text)) {
    return 'ja';
  } else if (/[áéíóúüñ¿¡]/.test(text)) {
    return 'es';
  } else {
    return 'en';
  }
}

/**
 * Validate API key
 */
export async function validateGeminiAPI(): Promise<boolean> {
  try {
    const testPrompt = 'Hello';
    const result = await model.generateContent(testPrompt);
    await result.response;
    return true;
  } catch (error) {
    console.error('Gemini API validation failed:', error);
    return false;
  }
}
