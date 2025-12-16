import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Send,
  Loader2,
  RefreshCw,
  Target,
  Zap,
  Clock,
} from "lucide-react";

// Demo insights data
const aiInsights = [
  {
    type: "optimization",
    title: "Test Parallelization Opportunity",
    description: "Your database tests could run 40% faster by parallelizing integration tests. Currently, 23 tests run sequentially that have no shared state.",
    impact: "high",
    category: "Performance",
    estimatedSavings: "12 minutes per build",
  },
  {
    type: "warning",
    title: "Flaky Test Pattern Detected",
    description: "The 'UserSession.timeout' test has failed 8 times in the last 50 runs with timing-related errors. Consider adding explicit waits or mocking time.",
    impact: "medium",
    category: "Reliability",
    affectedTests: 3,
  },
  {
    type: "suggestion",
    title: "Coverage Gap in Payment Module",
    description: "The refund processing logic has only 45% branch coverage. Critical error paths are untested, which may explain recent production issues.",
    impact: "critical",
    category: "Coverage",
    missingCoverage: "12 branches",
  },
  {
    type: "optimization",
    title: "Build Cache Optimization",
    description: "Enabling incremental compilation for your TypeScript tests would reduce build times by approximately 25%.",
    impact: "medium",
    category: "Performance",
    estimatedSavings: "8 minutes per build",
  },
];

const predictions = [
  { metric: "Next build success probability", value: 92, trend: "up" },
  { metric: "Estimated queue wait time", value: 15, unit: "min", trend: "down" },
  { metric: "Weekly failure prediction", value: 12, unit: "failures", trend: "stable" },
];

export default function AIInsights() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const getImpactBadge = (impact: string) => {
    const styles = {
      critical: "bg-destructive/20 text-destructive border-destructive/30",
      high: "bg-secondary/20 text-secondary border-secondary/30",
      medium: "bg-primary/20 text-primary border-primary/30",
      low: "bg-muted text-muted-foreground border-border",
    };
    return styles[impact as keyof typeof styles] || styles.low;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-primary" />;
      default:
        return <Sparkles className="h-5 w-5 text-accent" />;
    }
  };

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI response (in real app, would call generateAI from api.ts)
    setTimeout(() => {
      setAiResponse(
        "Based on my analysis of your test patterns, I recommend the following:\n\n" +
        "1. **Prioritize the payment tests** - They have the highest failure correlation with production issues\n\n" +
        "2. **Add retry logic** for the flaky database connection tests - A simple 3-retry mechanism would improve reliability by 95%\n\n" +
        "3. **Consider test sharding** - Your test suite would benefit from splitting into 4 parallel shards, reducing total execution time from 15 minutes to approximately 4 minutes"
      );
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-accent" />
            AI Insights
          </h1>
          <p className="text-muted-foreground">
            Intelligent analysis and recommendations for your testing pipeline
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* AI Predictions */}
      <div className="grid gap-4 md:grid-cols-3">
        {predictions.map((prediction, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{prediction.metric}</p>
                {prediction.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {prediction.trend === "down" && <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />}
                {prediction.trend === "stable" && <Target className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-3xl font-bold text-foreground">
                {prediction.value}
                {prediction.unit && <span className="text-lg text-muted-foreground ml-1">{prediction.unit}</span>}
                {!prediction.unit && <span className="text-lg text-muted-foreground ml-1">%</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ask AI Section */}
      <Card className="bg-gradient-to-br from-accent/10 via-background to-primary/10 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Ask AI Assistant
          </CardTitle>
          <CardDescription>
            Get personalized recommendations and analysis for your testing strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask anything about your tests, build queue, or optimization strategies..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] bg-background/50"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPrompt("How can I speed up my test suite?")}>
                <Zap className="h-3 w-3 mr-1" />
                Speed tips
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPrompt("Why are my tests flaky?")}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Flaky tests
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPrompt("What should I prioritize?")}>
                <Target className="h-3 w-3 mr-1" />
                Priorities
              </Button>
            </div>
            <Button onClick={handleAskAI} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </div>

          {aiResponse && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-accent" />
                <span className="font-semibold text-foreground">AI Response</span>
              </div>
              <div className="prose prose-sm text-foreground/90 whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights List */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Insights</CardTitle>
          <CardDescription>AI-generated recommendations based on your testing patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiInsights.map((insight, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getInsightIcon(insight.type)}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{insight.category}</Badge>
                  <Badge variant="outline" className={getImpactBadge(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                </div>
              </div>
              {insight.estimatedSavings && (
                <div className="flex items-center gap-2 text-sm text-green-500 ml-8">
                  <Clock className="h-4 w-4" />
                  Potential savings: {insight.estimatedSavings}
                </div>
              )}
              {insight.affectedTests && (
                <div className="flex items-center gap-2 text-sm text-destructive ml-8">
                  <AlertTriangle className="h-4 w-4" />
                  {insight.affectedTests} tests affected
                </div>
              )}
              {insight.missingCoverage && (
                <div className="flex items-center gap-2 text-sm text-secondary ml-8">
                  <Target className="h-4 w-4" />
                  Missing: {insight.missingCoverage}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
