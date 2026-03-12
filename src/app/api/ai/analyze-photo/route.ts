import { NextResponse } from 'next/server';
import { isGeminiAvailable, analyzeImage } from '@/lib/ai/gemini-client';
import { buildPhotoAnalysisPrompt } from '@/lib/ai/prompts';
import { PhotoAnalysisResponse } from '@/lib/ai/types';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  if (!isGeminiAvailable()) {
    return NextResponse.json(
      { error: 'Gemini API key not configured. Set GEMINI_API_KEY environment variable.' },
      { status: 501 },
    );
  }

  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'imageBase64 and mimeType required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    const sizeBytes = Math.ceil(imageBase64.length * 0.75);
    if (sizeBytes > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image too large. Maximum 10MB.' }, { status: 400 });
    }

    const prompt = buildPhotoAnalysisPrompt();
    const raw = await analyzeImage(imageBase64, mimeType, prompt);
    const parsed: PhotoAnalysisResponse = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Photo analysis failed: ${message}` }, { status: 502 });
  }
}
