import { NextResponse } from 'next/server';
import { isOpenAIAvailable, chatCompletion } from '@/lib/ai/openai-client';
import { buildSOWParserPrompt } from '@/lib/ai/prompts';
import { SOWParseResponse } from '@/lib/ai/types';

export async function POST(request: Request) {
  if (!isOpenAIAvailable()) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.' },
      { status: 501 },
    );
  }

  try {
    const { rawText } = await request.json();

    if (!rawText || typeof rawText !== 'string' || rawText.length > 50000) {
      return NextResponse.json(
        { error: 'rawText is required and must be under 50,000 characters' },
        { status: 400 },
      );
    }

    const { system, user } = buildSOWParserPrompt(rawText);

    const raw = await chatCompletion(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { jsonMode: true, temperature: 0.1 },
    );

    const parsed: SOWParseResponse = JSON.parse(raw);

    // Strip any pricing fields the LLM might have hallucinated
    if (parsed.parsedInput?.estimateControls) {
      delete (parsed.parsedInput as Record<string, unknown>).estimateControls;
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('timeout') || message.includes('aborted')) {
      return NextResponse.json({ error: 'AI request timed out' }, { status: 504 });
    }
    return NextResponse.json({ error: `SOW parse failed: ${message}` }, { status: 502 });
  }
}
