'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatBuilderResponse } from '@/lib/ai/types';
import { EstimateInput } from '@/lib/estimate/types';

interface ChatBuilderProps {
  currentInput: Partial<EstimateInput>;
  onApplyFields: (fields: Record<string, unknown>) => void;
  onGenerateEstimate: () => void;
}

export function ChatBuilder({ currentInput, onApplyFields, onGenerateEstimate }: ChatBuilderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completeness, setCompleteness] = useState(0);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // Auto-start with first question
  useEffect(() => {
    if (messages.length === 0) {
      sendToAI([{ role: 'user', content: 'Start the estimate. What do you need to know first?' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendToAI(chatMessages: ChatMessage[]) {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/chat-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, currentInput }),
      });
      const data: ChatBuilderResponse = await res.json();

      if (!res.ok) {
        setError((data as unknown as { error: string }).error || 'Chat failed');
        return;
      }

      setMessages([...chatMessages, { role: 'assistant', content: data.reply }]);
      setCompleteness(data.inputCompleteness);

      if (data.updatedFields && Object.keys(data.updatedFields).length > 0) {
        onApplyFields(data.updatedFields);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    if (!userInput.trim() || loading) return;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    sendToAI(newMessages);
  }

  return (
    <div className="rounded-lg border-2 border-green-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-green-100">
        <div className="flex items-center gap-2">
          <span className="rounded bg-green-200 px-2 py-0.5 text-xs font-bold text-green-800">Chat</span>
          <span className="font-medium text-gray-900">Estimate Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.min(completeness * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(completeness * 100)}%</span>
          </div>
          {completeness >= 0.6 && (
            <button
              onClick={onGenerateEstimate}
              className="rounded bg-[#2563EB] px-3 py-1 text-xs font-medium text-white hover:bg-blue-600"
            >
              Generate Estimate
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="h-80 overflow-y-auto px-4 py-3 space-y-3">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="border-t border-green-100 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your answer..."
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !userInput.trim()}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
