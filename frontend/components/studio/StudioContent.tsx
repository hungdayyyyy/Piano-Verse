"use client";

import { useState } from "react";
import { Wand2, Sparkles, Save, Loader2, Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PianoRollEditor } from "./PianoRollEditor";
import { useGetCompositionIdeasMutation } from "@/features/ai/aiApi";
import { toast } from "sonner";

export function StudioContent() {
  const [title, setTitle] = useState("Untitled Composition");
  const [ideas, setIdeas] = useState<{ chordProgressions: string[]; melodyIdeas: string[] } | null>(null);
  const [getIdeas, { isLoading: ideasLoading }] = useGetCompositionIdeasMutation();

  const handleGetIdeas = async () => {
    try {
      const res = await getIdeas({ style: "classical", mood: "contemplative" }).unwrap();
      setIdeas(res.data ?? null);
      toast.success("AI ideas generated!");
    } catch {
      toast.error("Could not generate ideas");
    }
  };

  const handleSave = () => {
    toast.info("Composition saving requires backend implementation (POST /api/compositions — currently TODO stub)");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Wand2 className="h-6 w-6 text-[var(--primary)]" />
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-0 bg-transparent px-0 focus:ring-0 h-auto"
          />
        </div>
        <Badge variant="mocked" className="gap-1.5">
          <Construction className="h-3 w-3" />
          Backend stub
        </Badge>
        <Button onClick={handleSave} variant="outline" size="sm">
          <Save className="mr-1.5 h-3.5 w-3.5" />Save
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Piano Roll — takes 2/3 */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Piano Roll</CardTitle>
              <CardDescription>Click to add notes, click again to remove</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <PianoRollEditor />
            </CardContent>
          </Card>
        </div>

        {/* Side panels — 1/3 */}
        <div className="space-y-4">
          {/* AI Harmony Assistant */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                AI Harmony
                <Badge variant="mocked" className="text-[10px]">Mocked</Badge>
              </CardTitle>
              <CardDescription>Get chord and melody suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleGetIdeas} disabled={ideasLoading} variant="outline" className="w-full" size="sm">
                {ideasLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Ideas
              </Button>

              {ideas && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-1.5">Chord Progressions</p>
                    <div className="space-y-1">
                      {ideas.chordProgressions.map((p, i) => (
                        <div key={i} className="rounded bg-[var(--background-muted)] px-2.5 py-1.5 text-xs font-mono cursor-pointer hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors" title="Click to apply (backend pending)">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-1.5">Melody Ideas</p>
                    <div className="space-y-1">
                      {ideas.melodyIdeas.map((m, i) => (
                        <div key={i} className="rounded bg-[var(--background-muted)] px-2.5 py-1.5 text-xs text-[var(--foreground-muted)]">{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Composition info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-sm">Composition Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["BPM", "120"],
                ["Time Signature", "4/4"],
                ["Key", "C Major"],
                ["Export", "MIDI / PDF (pending)"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">{k}</span>
                  <span className="font-medium text-xs">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Backend status note */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-400 font-medium mb-1">Backend Status</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Composition CRUD endpoints are TODO stubs. The piano roll editor works locally — connect to <code className="text-amber-400">POST /api/compositions/create</code> when backend is ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
