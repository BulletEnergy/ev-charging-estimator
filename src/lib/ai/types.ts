import { EstimateInput, EstimateOutput, SOWLineItem } from '@/lib/estimate/types';

export type { SOWLineItem };

// ── SOW Parser ──────────────────────────────────────────────

export interface SOWParseRequest {
  rawText: string;
}

export interface SOWParseResponse {
  parsedInput: Partial<EstimateInput>;
  /** Tabular proposals: extracted rows with qty, unit price, amount from the document */
  rawLineItems?: SOWLineItem[];
  sowFormat: 'tabular' | 'narrative';
  confidence: number;
  missingFields: string[];
  assumptions: string[];
}

// ── Chat Builder ────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatBuilderRequest {
  messages: ChatMessage[];
  currentInput: Partial<EstimateInput>;
}

export interface ChatBuilderResponse {
  reply: string;
  updatedFields: Record<string, unknown>;
  nextQuestion: string | null;
  inputCompleteness: number;
}

// ── AI Reviewer ─────────────────────────────────────────────

export interface ReviewEstimateRequest {
  input: EstimateInput;
  output: EstimateOutput;
}

export interface ReviewFinding {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  affectedLineItems: string[];
}

export interface SuggestedChange {
  field: string;
  currentValue: unknown;
  suggestedValue: unknown;
  reason: string;
}

export interface ReviewEstimateResponse {
  findings: ReviewFinding[];
  overallAssessment: string;
  suggestedChanges: SuggestedChange[];
}

// ── Photo Analysis ──────────────────────────────────────────

export interface PhotoAnalysisRequest {
  imageBase64: string;
  mimeType: string;
}

export interface PhotoAnalysisResponse {
  siteDescription: string;
  inferredFields: Partial<EstimateInput>;
  concerns: string[];
  confidence: number;
}

// ── AI Status ───────────────────────────────────────────────

export interface AIStatusResponse {
  openai: boolean;
  gemini: boolean;
}
