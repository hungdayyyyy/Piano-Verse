import type { Metadata } from "next";
import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AIAssistantChat } from "@/components/ai/AIAssistantChat";
import { PerformanceAnalyzer } from "@/components/ai/PerformanceAnalyzer";
import { RecommendationPanel } from "@/components/ai/RecommendationPanel";
import { AIStudioContent } from "@/components/ai/AIStudioContent";

export const metadata: Metadata = { title: "AI Studio" };

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Studio</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            AI-powered tools for learning, analysis, and composition
          </p>
        </div>
        <Badge variant="mocked" className="gap-1.5">
          <Cpu className="h-3 w-3" />
          Preview Mode
        </Badge>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">AI Teacher</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="compose">Composition Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <AIAssistantChat />
        </TabsContent>

        <TabsContent value="analysis">
          <PerformanceAnalyzer />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationPanel />
        </TabsContent>

        <TabsContent value="compose">
          <AIStudioContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
