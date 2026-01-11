import { NextRequest, NextResponse } from 'next/server';
import { generateRestaurantResponse, improveResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, action, language } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    let result: string;

    switch (action) {
      case 'improve':
        result = await improveResponse(prompt, language || 'ja');
        break;
      case 'generate':
      default:
        result = await generateRestaurantResponse(prompt, context);
        break;
    }

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Response generation failed' },
      { status: 500 }
    );
  }
}
