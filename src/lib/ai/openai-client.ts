export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// ── Text-only chat completions ──────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o';

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 4096,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

// ── Vision / multi-image chat completions (GPT-5.4) ─────────

const VISION_MODEL = process.env.OPENAI_VISION_MODEL ?? 'gpt-5.4';

export interface VisionFile {
  base64: string;
  mimeType: string;
}

interface VisionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  detail?: 'low' | 'high' | 'auto';
}

export async function visionCompletion(
  systemPrompt: string,
  textPrompt: string,
  files: VisionFile[],
  options: VisionOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const model = options.model ?? VISION_MODEL;
  const detail = options.detail ?? 'high';

  const contentParts: Record<string, unknown>[] = [];

  for (const file of files) {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: `data:${file.mimeType};base64,${file.base64}`,
        detail,
      },
    });
  }

  contentParts.push({ type: 'text', text: textPrompt });

  const messages: Record<string, unknown>[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contentParts },
  ];

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 8192,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const timeoutMs = Math.max(60000, files.length * 20000);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI Vision API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}
