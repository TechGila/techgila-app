import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Filter,
  Download,
  Play,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Demo test data
type TestStatus = "passed" | "failed" | "flaky" | "skipped";

interface TestResult {
  id: string;
  name: string;
  suite: string;
  status: TestStatus;
  duration: number;
  lastRun: string;
  flakyRate: number;
  coverage: number;
  errorMessage: string | null;
  stackTrace: string | null;
}

const generateTestData = (): TestResult[] => {
  const suites = [
    { name: "Authentication", prefix: "auth" },
    { name: "Payment Processing", prefix: "payment" },
    { name: "Dashboard Components", prefix: "dashboard" },
    { name: "API Integration", prefix: "api" },
    { name: "User Management", prefix: "user" },
  ];

  const results: TestResult[] = [];

  suites.forEach((suite) => {
    const testCount = Math.floor(Math.random() * 20) + 10;
    for (let i = 1; i <= testCount; i++) {
      const status = Math.random();
      let testStatus: TestStatus = "passed";
      if (status < 0.1) testStatus = "failed";
      else if (status < 0.15) testStatus = "flaky";
      else if (status < 0.2) testStatus = "skipped";

      results.push({
        id: `${suite.prefix}-${i}`,
        name: `${suite.name} Test Case ${i}`,
        suite: suite.name,
        status: testStatus,
        duration: Math.floor(Math.random() * 5000) + 100,
        lastRun: `${Math.floor(Math.random() * 30) + 1} min ago`,
        flakyRate: Math.floor(Math.random() * 30),
        coverage: Math.floor(Math.random() * 40) + 60,
        errorMessage:
          testStatus === "failed"
            ? `AssertionError: Expected value to be true but got false`
            : null,
        stackTrace:
          testStatus === "failed"
            ? `at Object.<anonymous> (src/tests/${suite.prefix}.test.ts:${
                Math.floor(Math.random() * 100) + 1
              })`
            : null,
      });
    }
  });

  return results;
};

const coverageData = [
  { name: "Statements", coverage: 82, target: 80 },
  { name: "Branches", coverage: 71, target: 75 },
  { name: "Functions", coverage: 88, target: 80 },
  { name: "Lines", coverage: 84, target: 80 },
];

const trendData = [
  { day: "Mon", passed: 145, failed: 8, flaky: 3 },
  { day: "Tue", passed: 152, failed: 5, flaky: 2 },
  { day: "Wed", passed: 148, failed: 12, flaky: 5 },
  { day: "Thu", passed: 160, failed: 3, flaky: 1 },
  { day: "Fri", passed: 155, failed: 6, flaky: 4 },
  { day: "Sat", passed: 140, failed: 2, flaky: 0 },
  { day: "Sun", passed: 158, failed: 4, flaky: 2 },
];

export default function TestResults() {
  const { toast } = useToast();
  const [testData, setTestData] = useState<TestResult[]>(generateTestData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedTests, setExpandedTests] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const statusCounts = {
    passed: testData.filter((t) => t.status === "passed").length,
    failed: testData.filter((t) => t.status === "failed").length,
    flaky: testData.filter((t) => t.status === "flaky").length,
    skipped: testData.filter((t) => t.status === "skipped").length,
  };

  const totalTests = testData.length;
  const passRate = ((statusCounts.passed / totalTests) * 100).toFixed(1);

  const filteredTests = testData.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.suite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "failed" && test.status === "failed") ||
      (activeTab === "flaky" && test.status === "flaky") ||
      (activeTab === "passed" && test.status === "passed");
    const matchesSuite = !selectedSuite || test.suite === selectedSuite;
    return matchesSearch && matchesTab && matchesSuite;
  });

  const suites = [...new Set(testData.map((t) => t.suite))];

  const pieData = [
    { name: "Passed", value: statusCounts.passed, color: "#22c55e" },
    { name: "Failed", value: statusCounts.failed, color: "#ef4444" },
    { name: "Flaky", value: statusCounts.flaky, color: "#f97316" },
    { name: "Skipped", value: statusCounts.skipped, color: "#6b7280" },
  ];

  const getStatusIcon = (status: TestStatus): JSX.Element => {
    switch (status) {
      case "passed":
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case "failed":
        return <XCircle className='h-4 w-4 text-destructive' />;
      case "flaky":
        return <AlertTriangle className='h-4 w-4 text-orange-500' />;
      default:
        return <Clock className='h-4 w-4 text-muted-foreground' />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const styles: Record<TestStatus, string> = {
      passed: "bg-green-500/20 text-green-500 border-green-500/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
      flaky: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      skipped: "bg-muted text-muted-foreground border-border",
    };
    return styles[status] || styles.skipped;
  };

  const toggleExpanded = (id: string) => {
    setExpandedTests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTestData(generateTestData());
      setIsRefreshing(false);
      toast({
        title: "Tests refreshed",
        description: "Latest test results have been loaded.",
      });
    }, 1500);
  }, [toast]);

  const handleRerunFailed = () => {
    toast({
      title: "Re-running failed tests",
      description: `${statusCounts.failed} tests queued for re-run.`,
    });
    setTimeout(() => {
      setTestData((prev) =>
        prev.map((t) =>
          t.status === "failed" && Math.random() > 0.5
            ? { ...t, status: "passed" }
            : t
        )
      );
      toast({
        title: "Re-run complete",
        description: "Some failed tests now pass.",
      });
      try {
        window.dispatchEvent(
          new CustomEvent("notification:add", {
            detail: {
              title: "Tests re-run",
              description: `${statusCounts.failed} tests re-run`,
            },
          })
        );
      } catch (e) {
        console.warn("notification dispatch failed", e);
      }
    }, 3000);
  };

  const handleDownloadReport = () => {
    toast({
      title: "Generating report",
      description: "Your test report will download shortly.",
    });

    // simulate download
    const csv = [
      ["id", "name", "suite", "status", "duration", "coverage"],
      ...testData
        .slice(0, 200)
        .map((t) => [t.id, t.name, t.suite, t.status, t.duration, t.coverage]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-results-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // listen for global refresh event
  useEffect(() => {
    const onRefresh = () => handleRefresh();
    window.addEventListener("global:refresh", onRefresh as EventListener);
    return () =>
      window.removeEventListener("global:refresh", onRefresh as EventListener);
  }, [handleRefresh]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground flex items-center gap-2'>
            <Activity className='h-6 w-6 text-primary' />
            Test Results
          </h1>
          <p className='text-muted-foreground'>
            Comprehensive test analytics and execution history
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleDownloadReport}>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button
            variant='outline'
            onClick={handleRerunFailed}
            disabled={statusCounts.failed === 0}
          >
            <Play className='h-4 w-4 mr-2' />
            Re-run Failed
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Pass Rate</p>
                <p className='text-3xl font-bold text-green-500'>{passRate}%</p>
              </div>
              <div className='h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center'>
                {Number(passRate) >= 80 ? (
                  <TrendingUp className='h-6 w-6 text-green-500' />
                ) : (
                  <TrendingDown className='h-6 w-6 text-destructive' />
                )}
              </div>
            </div>
            <Progress value={Number(passRate)} className='mt-3 h-2' />
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total Tests</p>
                <p className='text-3xl font-bold text-foreground'>
                  {totalTests}
                </p>
              </div>
              <div className='h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center'>
                <BarChart2 className='h-6 w-6 text-primary' />
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>
              Across {suites.length} test suites
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Failed</p>
                <p className='text-3xl font-bold text-destructive'>
                  {statusCounts.failed}
                </p>
              </div>
              <div className='h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center'>
                <XCircle className='h-6 w-6 text-destructive' />
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>
              {statusCounts.flaky} flaky tests detected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Avg Duration</p>
                <p className='text-3xl font-bold text-foreground'>
                  {(
                    testData.reduce((a, b) => a + b.duration, 0) /
                    testData.length /
                    1000
                  ).toFixed(1)}
                  s
                </p>
              </div>
              <div className='h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center'>
                <Clock className='h-6 w-6 text-orange-500' />
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>
              Per test execution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Trend Chart */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Test Trends</CardTitle>
            <CardDescription>
              Daily test results over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-48 sm:h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={trendData}>
                  <XAxis
                    dataKey='day'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey='passed'
                    fill='#22c55e'
                    stackId='a'
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey='failed'
                    fill='#ef4444'
                    stackId='a'
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey='flaky'
                    fill='#f97316'
                    stackId='a'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
            <CardDescription>Current test status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-48 sm:h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='flex flex-wrap gap-4 mt-2 justify-center'>
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className='flex items-center gap-2 text-sm'
                >
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='text-muted-foreground'>{item.name}</span>
                  <span className='font-medium text-foreground'>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Code Coverage</CardTitle>
          <CardDescription>Current coverage metrics vs targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {coverageData.map((item) => (
              <div key={item.name} className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{item.name}</span>
                  <span
                    className={`font-medium ${
                      item.coverage >= item.target
                        ? "text-green-500"
                        : "text-orange-500"
                    }`}
                  >
                    {item.coverage}%
                  </span>
                </div>
                <Progress
                  value={item.coverage}
                  className={`h-2 ${
                    item.coverage >= item.target ? "" : "bg-orange-500/20"
                  }`}
                />
                <p className='text-xs text-muted-foreground'>
                  Target: {item.target}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test List */}
      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                {filteredTests.length} tests displayed
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value='all'>All ({totalTests})</TabsTrigger>
                <TabsTrigger value='failed' className='text-destructive'>
                  Failed ({statusCounts.failed})
                </TabsTrigger>
                <TabsTrigger value='flaky' className='text-orange-500'>
                  Flaky ({statusCounts.flaky})
                </TabsTrigger>
                <TabsTrigger value='passed' className='text-green-500'>
                  Passed ({statusCounts.passed})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search tests...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex gap-2 flex-wrap'>
              <Button
                variant={selectedSuite === null ? "secondary" : "outline"}
                size='sm'
                onClick={() => setSelectedSuite(null)}
              >
                All Suites
              </Button>
              {suites.map((suite) => (
                <Button
                  key={suite}
                  variant={selectedSuite === suite ? "secondary" : "outline"}
                  size='sm'
                  onClick={() => setSelectedSuite(suite)}
                >
                  {suite}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile list (accordion cards) */}
          <div className='block sm:hidden'>
            <div className='space-y-3'>
              {filteredTests.length === 0 ? (
                <div className='text-center py-6 text-muted-foreground'>
                  No tests found.
                </div>
              ) : (
                filteredTests.slice(0, 50).map((test) => (
                  <Collapsible
                    key={test.id}
                    className='rounded-lg border border-border'
                  >
                    <div className='p-4 flex items-start justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8'>
                            {getStatusIcon(test.status)}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-medium text-foreground truncate'>
                              {test.name}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {test.suite} • {test.lastRun}
                            </p>
                          </div>
                        </div>
                        <div className='mt-3 flex items-center gap-3 text-sm text-muted-foreground flex-wrap'>
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4' />
                            <span>{test.duration}ms</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Progress
                              value={test.coverage}
                              className='w-24 h-2'
                            />
                            <span className='text-xs'>{test.coverage}%</span>
                          </div>
                          <div>
                            <Badge
                              variant='outline'
                              className={getStatusBadge(test.status)}
                            >
                              {test.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                          >
                            {expandedTests.includes(test.id) ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent className='p-4 pt-0 border-t border-border'>
                      {test.errorMessage && (
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-destructive'>
                            Error: {test.errorMessage}
                          </p>
                          <pre className='text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto'>
                            {test.stackTrace}
                          </pre>
                          <div className='flex gap-2'>
                            <Button size='sm' variant='outline'>
                              <Play className='h-3 w-3 mr-1' />
                              Re-run Test
                            </Button>
                            <Button size='sm' variant='ghost'>
                              View Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
            </div>
          </div>

          {/* Test Table (desktop) */}
          <div className='hidden sm:block rounded-lg border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='w-12'></TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Suite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.slice(0, 20).map((test) => (
                  <Collapsible key={test.id} asChild>
                    <>
                      <TableRow className='hover:bg-muted/30'>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6'
                              onClick={() => toggleExpanded(test.id)}
                            >
                              {expandedTests.includes(test.id) ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getStatusIcon(test.status)}
                            <span className='font-medium text-foreground'>
                              {test.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {test.suite}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={getStatusBadge(test.status)}
                          >
                            {test.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {test.duration}ms
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Progress
                              value={test.coverage}
                              className='w-16 h-2'
                            />
                            <span className='text-xs text-muted-foreground'>
                              {test.coverage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {test.lastRun}
                        </TableCell>
                      </TableRow>
                      {expandedTests.includes(test.id) && test.errorMessage && (
                        <TableRow>
                          <TableCell colSpan={7} className='bg-muted/20 p-0'>
                            <CollapsibleContent>
                              <div className='p-4 space-y-2'>
                                <p className='text-sm font-medium text-destructive'>
                                  Error: {test.errorMessage}
                                </p>
                                <pre className='text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto'>
                                  {test.stackTrace}
                                </pre>
                                <div className='flex gap-2'>
                                  <Button size='sm' variant='outline'>
                                    <Play className='h-3 w-3 mr-1' />
                                    Re-run Test
                                  </Button>
                                  <Button size='sm' variant='ghost'>
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
