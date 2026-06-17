"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Loader2, Bot, User, RotateCcw, Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChatMutation } from "@/features/ai/aiApi";
import { toast } from "sonner";
import type { ChatMessage } from "@/features/ai/aiApi";

const QUICK_PROMPTS = [
  "How do I improve my left hand coordination?",
  "Explain the C major scale",
  "Tips for playing faster without mistakes",
  "What is music theory and where do I start?",
];

function MessageBubble({ msg, isStreaming }: { msg: ChatMessage; isStreaming?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
        isUser ? "bg-[var(--primary)]" : "bg-[var(--accent)]/20"
      }`}>
        {isUser
          ? <User className="h-3.5 w-3.5 text-[var(--primary-foreground)]" />
          : <Bot className="h-3.5 w-3.5 text-[var(--accent)]" />
        }
      </div>
      <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
        isUser
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm"
          : "bg-[var(--background-muted)] text-[var(--foreground)] rounded-tl-sm border border-[var(--border)]"
      }`}>
        {msg.content}
        {isStreaming && (
          <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-current" />
        )}
      </div>
    </div>
  );
}

export function AIAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI piano teacher. Ask me anything about piano technique, music theory, or practice strategies. 🎹",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chat, { isLoading }] = useChatMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: ChatMessage = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Optimistic assistant placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await chat({ messages: newMessages }).unwrap();
      const reply = typeof res.data === "string" ? res.data : "I'm here to help with your piano journey!";

      // Simulate token streaming for UX (backend returns full string)
      setMessages((prev) => [...prev.slice(0, -1)]);
      const words = reply.split(" ");
      let accumulated = "";
      for (let i = 0; i < words.length; i++) {
        accumulated += (i > 0 ? " " : "") + words[i];
        const snapshot = accumulated;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: snapshot },
        ]);
        await new Promise((r) => setTimeout(r, 30));
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
      toast.error("AI assistant unavailable");
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: "assistant",
      content: "Hi! I'm your AI piano teacher. Ask me anything about piano technique, music theory, or practice strategies. 🎹",
    }]);
  };

  return (
    <Card className="flex flex-col" style={{ height: "560px" }}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[var(--accent)]" />
            <CardTitle className="text-base">AI Piano Teacher</CardTitle>
            <Badge variant="mocked">Mocked</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset conversation">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <CardDescription>Ask about technique, theory, practice tips, or songs</CardDescription>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-0 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </CardContent>

      {/* Quick prompts */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={isLoading || isStreaming}
              className="flex flex-shrink-0 items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
            >
              <Lightbulb className="h-3 w-3" />
              {prompt.length > 30 ? prompt.slice(0, 28) + "…" : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-[var(--border)] p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI piano teacher…"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            disabled={isLoading || isStreaming}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isStreaming}
            size="icon"
          >
            {isLoading || isStreaming
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
    </Card>
  );
}
