import { NextRequest, NextResponse } from 'next/server';
import { translateText, TranslationRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();

    if (!body.text || !body.targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text and targetLanguage' },
        { status: 400 }
      );
    }

    const result = await translateText(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
