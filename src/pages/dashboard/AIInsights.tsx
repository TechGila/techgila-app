import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
// Note: ScrollArea removed in favor of native scroll containers for reliability
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Clock,
  GitBranch,
  Bug,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// AI Insights Data
const aiInsights = [
  {
    id: 1,
    type: "optimization",
    title: "Build Performance Opportunity",
    description:
      "Your payment-processing tests run 40% slower than average. Consider parallelizing the database setup fixtures.",
    impact: "high",
    icon: Zap,
    actionLabel: "View Details",
    timeAgo: "2 min ago",
  },
  {
    id: 2,
    type: "prediction",
    title: "Potential Test Failure Predicted",
    description:
      "Based on recent changes to auth.middleware.ts, there's a 78% chance the session timeout tests will fail.",
    impact: "medium",
    icon: AlertTriangle,
    actionLabel: "Run Tests",
    timeAgo: "5 min ago",
  },
  {
    id: 3,
    type: "success",
    title: "Coverage Milestone Reached",
    description:
      "The user management module has reached 95% test coverage, up from 72% last week. Great progress!",
    impact: "positive",
    icon: CheckCircle,
    actionLabel: "View Report",
    timeAgo: "12 min ago",
  },
  {
    id: 4,
    type: "suggestion",
    title: "Flaky Test Pattern Detected",
    description:
      "Tests in the Dashboard suite have been flaky 3x more than usual. Root cause appears to be async timing issues.",
    impact: "medium",
    icon: Bug,
    actionLabel: "Fix Suggestion",
    timeAgo: "18 min ago",
  },
  {
    id: 5,
    type: "security",
    title: "Security Test Recommendation",
    description:
      "Your API authentication tests don't cover token refresh scenarios. This is a common attack vector.",
    impact: "high",
    icon: Shield,
    actionLabel: "Add Tests",
    timeAgo: "25 min ago",
  },
];

const predictionCards = [
  {
    title: "Next Build Success Rate",
    value: "94%",
    trend: "up",
    change: "+3%",
    description: "Based on recent commit patterns",
  },
  {
    title: "Estimated Build Time",
    value: "2m 45s",
    trend: "down",
    change: "-15s",
    description: "Optimizations detected",
  },
  {
    title: "Test Stability Score",
    value: "87/100",
    trend: "up",
    change: "+5",
    description: "Flaky tests reduced",
  },
  {
    title: "Code Quality Index",
    value: "A+",
    trend: "up",
    change: "New",
    description: "Above industry average",
  },
];

// Chat messages
const initialMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your AI build assistant. I can help you understand test results, optimize builds, and predict potential issues. What would you like to know?",
    timestamp: new Date(Date.now() - 60000),
  },
];

const suggestedQuestions = [
  "Why did my last build fail?",
  "Which tests are most flaky?",
  "How can I speed up my builds?",
  "What's causing the coverage drop?",
];

export default function AIInsights() {
  const { toast } = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState(aiInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "medium":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "positive":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "why did my last build fail":
          "Your last build failed due to a timeout in the payment integration tests. The `checkout.spec.ts` file has a test that waits for a webhook response, but the mock server took too long to respond. I recommend:\n\n1. Increase the timeout from 5000ms to 10000ms\n2. Add retry logic for flaky network calls\n3. Consider using a local mock instead of the staging server",
        "which tests are most flaky":
          "Based on the last 30 days of data, here are your most flaky tests:\n\n1. **AuthSession.timeout** - 23% flaky rate (timing issue)\n2. **Dashboard.load** - 18% flaky rate (async rendering)\n3. **API.rateLimiting** - 12% flaky rate (test isolation)\n\nI can help you fix these. Would you like suggestions for any specific test?",
        "how can i speed up my builds":
          "I've analyzed your build patterns and found several optimization opportunities:\n\n1. **Parallelize test suites** - Your auth and payment tests can run in parallel (saves ~45s)\n2. **Cache node_modules** - Currently downloading fresh every build (saves ~30s)\n3. **Use incremental TypeScript** - Enable `incremental: true` in tsconfig (saves ~20s)\n\nImplementing all three could reduce build time by ~1.5 minutes.",
        "what's causing the coverage drop":
          "Your coverage dropped from 84% to 79% this week. The main causes are:\n\n1. **New payment module** - 200 lines added with only 45% coverage\n2. **Removed legacy tests** - 12 tests deleted without replacements\n3. **Skipped flaky tests** - 8 tests marked as `.skip()`\n\nFocusing on the payment module would recover most of the lost coverage.",
      };

      const lowerInput = inputValue.toLowerCase();
      let responseText =
        "I understand you're asking about your builds. Let me analyze your recent activity and provide insights...";

      for (const [key, value] of Object.entries(responses)) {
        if (lowerInput.includes(key.split(" ").slice(0, 3).join(" "))) {
          responseText = value;
          break;
        }
      }

      const assistantMessage = {
        id: messages.length + 2,
        role: "assistant" as const,
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      // If assistant provides a predictive or actionable response, add a notification
      if (responseText && responseText.length > 50) {
        try {
          window.dispatchEvent(
            new CustomEvent("notification:add", {
              detail: {
                title: "AI Insight",
                description: responseText.split("\n")[0],
              },
            })
          );
        } catch (e) {
          console.warn("notification dispatch failed", e);
        }
      }
    }, 2000);
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const handleRefreshInsights = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setInsights((prev) =>
        prev.map((insight) => ({
          ...insight,
          timeAgo: "Just now",
        }))
      );
      setIsRefreshing(false);
      toast({
        title: "Insights refreshed",
        description: "AI has analyzed the latest build data.",
      });
      try {
        window.dispatchEvent(
          new CustomEvent("notification:add", {
            detail: {
              title: "AI analysis ready",
              description: "New insights available",
            },
          })
        );
      } catch (e) {
        console.warn("notification dispatch failed", e);
      }
    }, 1500);
  };

  const handleInsightAction = (insight: (typeof aiInsights)[0]) => {
    toast({
      title: insight.title,
      description: `Opening ${insight.actionLabel.toLowerCase()}...`,
    });
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  };

  const handleFeedback = (messageId: number, positive: boolean) => {
    toast({
      title: positive ? "Thanks for the feedback!" : "We'll improve",
      description: positive
        ? "Glad this was helpful."
        : "We'll work on better responses.",
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground flex items-center gap-2'>
            <Sparkles className='h-6 w-6 text-primary' />
            AI Insights
          </h1>
          <p className='text-muted-foreground'>
            Intelligent analysis and predictions for your builds
          </p>
        </div>
        <Button onClick={handleRefreshInsights} disabled={isRefreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh Analysis
        </Button>
      </div>

      {/* Prediction Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {predictionCards.map((card, index) => (
          <Card key={index} className='hover:shadow-md transition-shadow'>
            <CardContent className='pt-6'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>{card.title}</p>
                  <p className='text-2xl font-bold text-foreground mt-1'>
                    {card.value}
                  </p>
                </div>
                <Badge
                  variant='outline'
                  className={
                    card.trend === "up"
                      ? "bg-green-500/20 text-green-500 border-green-500/30"
                      : "bg-primary/20 text-primary border-primary/30"
                  }
                >
                  {card.trend === "up" ? (
                    <TrendingUp className='h-3 w-3 mr-1' />
                  ) : (
                    <TrendingDown className='h-3 w-3 mr-1' />
                  )}
                  {card.change}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* AI Chat */}
        <Card className='flex flex-col h-[60vh] sm:h-[600px] overflow-y-scroll'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bot className='h-5 w-5 text-primary' />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your builds and tests
            </CardDescription>
          </CardHeader>
          <CardContent className='flex-1 flex flex-col'>
            {/* Messages */}
            <div className='flex-1 pr-4 min-h-0 h-full overflow-auto'>
              <div className='space-y-4 pb-24 sm:pb-0 min-h-0 flex flex-col'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 min-w-0 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
                        <Bot className='h-4 w-4 text-primary' />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] sm:max-w-[80%] min-w-0 break-words rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className='text-sm whitespace-pre-wrap break-words'>
                        {message.content}
                      </p>
                      {message.role === "assistant" && (
                        <div className='flex items-center gap-2 mt-2 pt-2 border-t border-border/50'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => handleCopyMessage(message.content)}
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => handleFeedback(message.id, true)}
                          >
                            <ThumbsUp className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => handleFeedback(message.id, false)}
                          >
                            <ThumbsDown className='h-3 w-3' />
                          </Button>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0'>
                        <User className='h-4 w-4 text-primary-foreground' />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className='flex gap-3'>
                    <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center'>
                      <Bot className='h-4 w-4 text-primary' />
                    </div>
                    <div className='bg-muted rounded-lg p-3'>
                      <div className='flex gap-1'>
                        <span className='w-2 h-2 bg-primary/50 rounded-full animate-bounce' />
                        <span
                          className='w-2 h-2 bg-primary/50 rounded-full animate-bounce'
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className='w-2 h-2 bg-primary/50 rounded-full animate-bounce'
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Questions (moved inside scroll area so they scroll with messages) */}
                <div className='flex gap-2 mt-4 overflow-x-auto pb-2 pr-2'>
                  <div className='flex flex-wrap gap-2'>
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        size='sm'
                        onClick={() => handleQuestionClick(question)}
                        className='text-xs whitespace-normal'
                      >
                        <Lightbulb className='h-3 w-3 mr-1' />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className='flex gap-2 flex-col md:flex-row justify-center sticky bottom-0 z-10 bg-background pt-2 pb-2 sm:pt-0 sm:pb-0'>
              <Input
                placeholder='Ask about your builds...'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Insights Feed */}
        <Card className='flex flex-col h-[60vh] sm:h-[600px] overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Lightbulb className='h-5 w-5 text-orange-500' />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI-generated recommendations based on your activity
            </CardDescription>
          </CardHeader>
          <CardContent className='flex-1 overflow-hidden'>
            <div className='h-full pr-4 overflow-auto'>
              <div className='space-y-4 pb-4'>
                {insights.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={insight.id}
                      className='group p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer'
                      onClick={() => handleInsightAction(insight)}
                    >
                      <div className='flex flex-col md:flex-row items-start gap-3'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            insight.impact === "high"
                              ? "bg-destructive/20"
                              : insight.impact === "positive"
                              ? "bg-green-500/20"
                              : "bg-orange-500/20"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              insight.impact === "high"
                                ? "text-destructive"
                                : insight.impact === "positive"
                                ? "text-green-500"
                                : "text-orange-500"
                            }`}
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2'>
                            <h4 className='font-medium text-foreground'>
                              {insight.title}
                            </h4>
                            <Badge
                              variant='outline'
                              className={getImpactStyles(insight.impact)}
                            >
                              {insight.impact}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {insight.description}
                          </p>
                          <div className='flex items-center justify-between mt-3'>
                            <span className='text-xs text-muted-foreground flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {insight.timeAgo}
                            </span>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='opacity-0 group-hover:opacity-100 transition-opacity'
                            >
                              {insight.actionLabel}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Summary */}
      <Card className='bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30'>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
              <Sparkles className='h-8 w-8 text-primary' />
            </div>
            <div className='flex-1 text-center md:text-left'>
              <h3 className='text-lg font-semibold text-foreground'>
                Today's AI Summary
              </h3>
              <p className='text-muted-foreground mt-1'>
                Your builds are performing{" "}
                <strong className='text-green-500'>12% faster</strong> than last
                week. The AI has identified{" "}
                <strong className='text-orange-500'>
                  3 optimization opportunities
                </strong>{" "}
                and predicts a{" "}
                <strong className='text-primary'>94% success rate</strong> for
                your next deployment. Focus on the payment module tests to
                maintain your excellent coverage metrics.
              </p>
            </div>
            <div className='flex flex-wrap justify-center gap-2'>
              <Button variant='outline'>
                <GitBranch className='h-4 w-4 mr-2' />
                View Branches
              </Button>
              <Button>
                <Zap className='h-4 w-4 mr-2' />
                Apply Suggestions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
