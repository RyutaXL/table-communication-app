import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI with Gemini API for production
let vertexAI: VertexAI;
let model: any;

try {
  // 本番環境ではサービスアカウント認証のみ使用
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'table-484004';
  console.log(`Initializing Vertex AI with project: ${projectId}, location: us-central1`);

  vertexAI = new VertexAI({
    project: projectId,
    location: 'us-central1',
  });

  model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });

  console.log('✅ Gemini API initialized successfully with service account authentication');
} catch (error) {
  console.error('❌ Failed to initialize Gemini API with service account:', error);
  console.error('Please check:');
  console.error('1. Service account has aiplatform.user role');
  console.error('2. Vertex AI API is enabled');
  console.error('3. GOOGLE_CLOUD_PROJECT environment variable is set');
  // エラーが発生してもアプリケーションは動作するようにする
  model = null;
}

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
  if (!vertexAI || !model) {
    throw new Error('Gemini API is not configured. Please check service account authentication.');
  }

  try {
    const { text, targetLanguage, context } = request;

    // Create context-aware prompt
    let prompt = `Translate the following text to ${targetLanguage === 'en' ? 'English' : targetLanguage === 'es' ? 'Spanish' : 'Japanese'}: "${text}"`;

    if (context) {
      prompt += `\n\nContext: This is for restaurant staff communicating with foreign customers. ${context}`;
    }

    prompt += '\n\nPlease provide only the translated text without any additional explanations or quotes.';

    console.log('Calling Vertex AI generateContent...');
    const result = await model.generateContent(prompt);
    console.log('Vertex AI response received');
    const response = await result.response;
    console.log('Response parsed:', response.candidates?.length || 0, 'candidates');
    const translatedText = response.candidates[0].content.parts[0].text.trim();
    console.log('Translation completed successfully');

    return {
      translatedText,
      detectedLanguage: detectLanguage(text),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Translation failed. Please check service account configuration.');
  }
}

/**
 * Generate restaurant-specific responses using Gemini
 */
export async function generateRestaurantResponse(prompt: string, context?: string): Promise<string> {
  if (!vertexAI || !model) {
    throw new Error('Gemini API is not configured. Please check service account authentication.');
  }

  try {
    let fullPrompt = `You are a helpful restaurant staff assistant. Generate a polite, clear response for: "${prompt}"`;

    if (context) {
      fullPrompt += `\n\nContext: ${context}`;
    }

    fullPrompt += '\n\nKeep the response concise and friendly. Focus on clear communication.';

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    return response.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Response generation failed. Please check service account configuration.');
  }
}

/**
 * Improve existing restaurant responses
 */
export async function improveResponse(text: string, language: 'en' | 'es' | 'ja' = 'ja'): Promise<string> {
  if (!vertexAI || !model) {
    console.warn('Gemini API is not configured. Returning original text.');
    return text; // Fallback to original text
  }

  try {
    const prompt = `Improve this restaurant response to make it more polite, clear, and culturally appropriate for ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'Japanese'} speakers: "${text}"

Please provide only the improved response without quotes or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.candidates[0].content.parts[0].text.trim();
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
  if (!vertexAI || !model) {
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
