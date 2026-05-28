import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ForecastCopilot from "@/components/forecast-copilot";

export default function AIPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-7 h-7 text-teal-600" />
        <div>
          <h1 className="text-xl font-bold">AI Forecast Copilot</h1>
          <p className="text-sm text-slate-500">
            Ask questions about your forecasts, models, and scenarios
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Chat</CardTitle>
          <CardDescription className="text-xs">
            The copilot is context-aware of your forecast domain. No LLM key required — uses rule-based fallback.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ForecastCopilot />
        </CardContent>
      </Card>
    </div>
  );
}
