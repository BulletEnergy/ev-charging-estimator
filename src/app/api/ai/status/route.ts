import { NextResponse } from 'next/server';
import { isOpenAIAvailable } from '@/lib/ai/openai-client';
import { isGeminiAvailable } from '@/lib/ai/gemini-client';

export async function GET() {
  return NextResponse.json({
    openai: isOpenAIAvailable(),
    gemini: isGeminiAvailable(),
  });
}
