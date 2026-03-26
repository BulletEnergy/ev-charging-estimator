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

// ── Photo / Document Analysis (multi-file, GPT-5.4) ────────

export interface AnalysisFile {
  base64: string;
  mimeType: string;
  fileName?: string;
}

/** @deprecated kept for backward compat — use MultiFileAnalysisRequest */
export interface PhotoAnalysisRequest {
  imageBase64: string;
  mimeType: string;
}

export interface MultiFileAnalysisRequest {
  files: AnalysisFile[];
}

export interface PhotoAnalysisResponse {
  siteDescription: string;
  inferredFields: Partial<EstimateInput>;
  concerns: string[];
  confidence: number;
  /** Per-file observations when multiple files are uploaded */
  fileNotes?: Array<{ fileName: string; note: string }>;
}

// ── AI Status ───────────────────────────────────────────────

export interface AIStatusResponse {
  openai: boolean;
  gemini: boolean;
}
