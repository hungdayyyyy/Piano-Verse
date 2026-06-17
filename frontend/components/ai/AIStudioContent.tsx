"use client";

import { useState } from "react";
import { Cpu, Sparkles, Music2, MessageSquare, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMutation, useGetCompositionIdeasMutation } from "@/features/ai/aiApi";
import { toast } from "sonner";
import type { ChatMessage } from "@/features/ai/aiApi";

export function AIStudioContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chat, { isLoading: chatLoading }] = useChatMutation();
  const [getIdeas, { isLoading: ideasLoading }] = useGetCompositionIdeasMutation();
  const [ideas, setIdeas] = useState<{ chordProgressions: string[]; melodyIdeas: string[] } | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await chat({ messages: newMessages }).unwrap();
      const reply: ChatMessage = {
        role: "assistant",
        content: typeof res.data === "string" ? res.data : "I'm here to help with your piano journey!",
      };
      setMessages([...newMessages, reply]);
    } catch {
      toast.error("AI assistant unavailable");
      setMessages(newMessages);
    }
  };

  const fetchIdeas = async () => {
    try {
      const res = await getIdeas({ style: "classical", mood: "happy" }).unwrap();
      setIdeas(res.data ?? null);
    } catch {
      toast.error("Could not generate ideas");
    }
  };

  return (
    <div className="space-y-4">
      <Badge variant="mocked" className="text-sm px-3 py-1">
        <Cpu className="mr-1.5 h-3 w-3" />
        Preview — Backend AI endpoints return mocked/canned data. OpenAI integration pending.
      </Badge>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* AI Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
              AI Voice Assistant
            </CardTitle>
            <CardDescription>Ask anything about piano, music theory, or get practice tips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-64 overflow-y-auto rounded-lg bg-[var(--background-muted)] p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-xs text-[var(--foreground-muted)] text-center py-8">
                  Start a conversation with your AI piano teacher
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--background-card)] text-[var(--foreground)] border border-[var(--border)]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--foreground-muted)]" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about piano scales, chords, practice tips…"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={chatLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Composition Ideas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              Composition Ideas
            </CardTitle>
            <CardDescription>Generate chord progressions and melody ideas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={fetchIdeas} disabled={ideasLoading} variant="outline" className="w-full">
              {ideasLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
              ) : (
                <><Music2 className="mr-2 h-4 w-4" />Generate Ideas</>
              )}
            </Button>

            {ideas && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
                    Chord Progressions
                  </p>
                  <div className="space-y-1.5">
                    {ideas.chordProgressions.map((p, i) => (
                      <div key={i} className="rounded-md bg-[var(--background-muted)] px-3 py-2 text-sm font-mono">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
                    Melody Ideas
                  </p>
                  <div className="space-y-1.5">
                    {ideas.melodyIdeas.map((m, i) => (
                      <div key={i} className="rounded-md bg-[var(--background-muted)] px-3 py-2 text-sm">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
