import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  ChevronRight,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Demo test results data
const testRuns = [
  {
    id: "TR-1234",
    branch: "feature/user-authentication",
    commit: "abc123f",
    status: "passed",
    total: 142,
    passed: 140,
    failed: 0,
    skipped: 2,
    duration: "2m 34s",
    timestamp: "2024-12-15T10:30:00Z",
    coverage: 87,
  },
  {
    id: "TR-1233",
    branch: "hotfix/payment-processing",
    commit: "def456g",
    status: "failed",
    total: 89,
    passed: 84,
    failed: 5,
    skipped: 0,
    duration: "1m 45s",
    timestamp: "2024-12-15T09:15:00Z",
    coverage: 92,
  },
  {
    id: "TR-1232",
    branch: "main",
    commit: "ghi789h",
    status: "passed",
    total: 456,
    passed: 450,
    failed: 0,
    skipped: 6,
    duration: "8m 12s",
    timestamp: "2024-12-15T08:00:00Z",
    coverage: 89,
  },
  {
    id: "TR-1231",
    branch: "feature/dashboard-charts",
    commit: "jkl012i",
    status: "passed",
    total: 234,
    passed: 230,
    failed: 0,
    skipped: 4,
    duration: "4m 56s",
    timestamp: "2024-12-14T16:30:00Z",
    coverage: 78,
  },
  {
    id: "TR-1230",
    branch: "fix/api-rate-limiting",
    commit: "mno345j",
    status: "failed",
    total: 56,
    passed: 52,
    failed: 4,
    skipped: 0,
    duration: "1m 12s",
    timestamp: "2024-12-14T14:00:00Z",
    coverage: 85,
  },
];

const failedTests = [
  {
    name: "PaymentService.processRefund",
    suite: "payment/refund.test.ts",
    error: "Expected status 200 but received 500",
    duration: "234ms",
    lastPassed: "3 days ago",
  },
  {
    name: "AuthController.validateToken",
    suite: "auth/token.test.ts",
    error: "Token expiration not handled correctly",
    duration: "156ms",
    lastPassed: "1 day ago",
  },
  {
    name: "UserService.updateProfile",
    suite: "user/profile.test.ts",
    error: "Validation error for email field",
    duration: "89ms",
    lastPassed: "5 hours ago",
  },
];

const flakyTests = [
  { name: "Integration.DatabaseConnection", flakeRate: 15, runs: 100 },
  { name: "E2E.CheckoutFlow", flakeRate: 8, runs: 50 },
  { name: "Unit.CacheInvalidation", flakeRate: 5, runs: 200 },
];

export default function TestResults() {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "passed") {
      return (
        <Badge className="bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Passed
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test Results</h1>
          <p className="text-muted-foreground">
            View and analyze your test execution history
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold text-foreground">2,847</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +124 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold text-foreground">94.7%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={94.7} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-2xl font-bold text-foreground">3m 42s</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-green-500">
              <TrendingDown className="h-3 w-3 mr-1" />
              -12% faster
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flaky Tests</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Runs</TabsTrigger>
          <TabsTrigger value="failed">Failed Tests</TabsTrigger>
          <TabsTrigger value="flaky">Flaky Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Run History</CardTitle>
                  <CardDescription>Recent test executions across all branches</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search runs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusBadge(run.status)}
                      <div>
                        <p className="font-medium text-foreground">{run.branch}</p>
                        <p className="text-xs text-muted-foreground">
                          {run.id} • {run.commit} • {formatDate(run.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {run.passed}/{run.total} passed
                        </p>
                        <p className="text-xs text-muted-foreground">{run.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{run.coverage}%</p>
                        <p className="text-xs text-muted-foreground">coverage</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Failed Tests
              </CardTitle>
              <CardDescription>Tests that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedTests.map((test, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-destructive/30 bg-destructive/5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{test.name}</p>
                        <p className="text-sm text-muted-foreground">{test.suite}</p>
                      </div>
                      <Badge variant="outline" className="text-muted-foreground">
                        {test.duration}
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 rounded bg-muted/50 font-mono text-sm text-destructive">
                      {test.error}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Last passed: {test.lastPassed}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flaky" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-destructive" />
                Flaky Tests
              </CardTitle>
              <CardDescription>Tests with inconsistent results that may need investigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flakyTests.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{test.name}</p>
                      <p className="text-sm text-muted-foreground">{test.runs} runs analyzed</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">{test.flakeRate}%</p>
                        <p className="text-xs text-muted-foreground">flake rate</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
