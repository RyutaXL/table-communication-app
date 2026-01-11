import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.warn('GOOGLE_AI_API_KEY is not set. Gemini API features will not work.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Get the Gemini model
const model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' }) || null;

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
  if (!genAI || !model) {
    throw new Error('Gemini API is not configured. Please set GOOGLE_AI_API_KEY environment variable.');
  }

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
    if (error instanceof Error && error.message.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your GOOGLE_AI_API_KEY.');
    }
    throw new Error('Translation failed. Please try again later.');
  }
}

/**
 * Generate restaurant-specific responses using Gemini
 */
export async function generateRestaurantResponse(prompt: string, context?: string): Promise<string> {
  if (!genAI || !model) {
    throw new Error('Gemini API is not configured. Please set GOOGLE_AI_API_KEY environment variable.');
  }

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
    throw new Error('Response generation failed. Please try again later.');
  }
}

/**
 * Improve existing restaurant responses
 */
export async function improveResponse(text: string, language: 'en' | 'es' | 'ja' = 'ja'): Promise<string> {
  if (!genAI || !model) {
    console.warn('Gemini API is not configured. Returning original text.');
    return text; // Fallback to original text
  }

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
  if (!genAI || !model) {
    console.error('Gemini API is not configured');
    return false;
  }

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
