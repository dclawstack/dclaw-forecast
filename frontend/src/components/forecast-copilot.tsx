"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessage, getChatHistory, type ChatMessage } from "@/lib/api";

const SESSION_KEY = "dclaw-forecast-copilot-session";

function getOrCreateSession(): string {
  if (typeof window === "undefined") return "default";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function ForecastCopilot({ context }: { context?: Record<string, unknown> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What does MAPE mean?",
    "How do I improve forecast accuracy?",
    "What is seasonal adjustment?",
  ]);
  const sessionId = useRef(getOrCreateSession());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatHistory(sessionId.current)
      .then((h) => setMessages(h.messages))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");
    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      session_id: sessionId.current,
      role: "user",
      content: text,
      context_data: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const res = await sendChatMessage({ session_id: sessionId.current, message: text, context });
      const assistantMsg: ChatMessage = {
        id: `local-${Date.now()}-a`,
        session_id: sessionId.current,
        role: "assistant",
        content: res.message,
        context_data: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSuggestions(res.suggestions);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-teal-400" />
            <p>Ask me anything about forecasting, models, or your data.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-teal-600" />
              </div>
            )}
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                msg.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {suggestions.length > 0 && messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-3 py-1 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-slate-100 p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about forecasts, accuracy, scenarios…"
          className="text-sm"
          disabled={sending}
        />
        <Button size="sm" onClick={() => send(input)} disabled={!input.trim() || sending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
