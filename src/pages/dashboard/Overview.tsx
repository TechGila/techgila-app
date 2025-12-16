import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

// Demo data with randomization
const generateBuildStats = () => [
  {
    name: "Mon",
    builds: 24 + Math.floor(Math.random() * 10),
    passed: 22 + Math.floor(Math.random() * 5),
    failed: 2 + Math.floor(Math.random() * 3),
  },
  {
    name: "Tue",
    builds: 32 + Math.floor(Math.random() * 10),
    passed: 28 + Math.floor(Math.random() * 5),
    failed: 4 + Math.floor(Math.random() * 3),
  },
  {
    name: "Wed",
    builds: 28 + Math.floor(Math.random() * 10),
    passed: 26 + Math.floor(Math.random() * 5),
    failed: 2 + Math.floor(Math.random() * 3),
  },
  {
    name: "Thu",
    builds: 45 + Math.floor(Math.random() * 10),
    passed: 40 + Math.floor(Math.random() * 5),
    failed: 5 + Math.floor(Math.random() * 3),
  },
  {
    name: "Fri",
    builds: 38 + Math.floor(Math.random() * 10),
    passed: 35 + Math.floor(Math.random() * 5),
    failed: 3 + Math.floor(Math.random() * 3),
  },
  {
    name: "Sat",
    builds: 12 + Math.floor(Math.random() * 5),
    passed: 12 + Math.floor(Math.random() * 3),
    failed: Math.floor(Math.random() * 2),
  },
  {
    name: "Sun",
    builds: 8 + Math.floor(Math.random() * 5),
    passed: 8 + Math.floor(Math.random() * 3),
    failed: Math.floor(Math.random() * 2),
  },
];

const hourlyData = [
  { hour: "6am", builds: 3 },
  { hour: "9am", builds: 12 },
  { hour: "12pm", builds: 18 },
  { hour: "3pm", builds: 22 },
  { hour: "6pm", builds: 15 },
  { hour: "9pm", builds: 8 },
];

const initialRecentBuilds = [
  {
    id: "B-1234",
    name: "feature/auth-flow",
    status: "passed",
    duration: "2m 34s",
    time: "2 min ago",
    author: "Sarah C.",
  },
  {
    id: "B-1233",
    name: "fix/payment-bug",
    status: "passed",
    duration: "1m 45s",
    time: "15 min ago",
    author: "Mike J.",
  },
  {
    id: "B-1232",
    name: "main",
    status: "failed",
    duration: "3m 12s",
    time: "1 hour ago",
    author: "Emily D.",
  },
  {
    id: "B-1231",
    name: "feature/dashboard",
    status: "passed",
    duration: "2m 08s",
    time: "2 hours ago",
    author: "Alex K.",
  },
  {
    id: "B-1230",
    name: "hotfix/api",
    status: "running",
    duration: "1m 23s",
    time: "Running",
    author: "Jordan S.",
  },
];

const initialQueuedBuilds = [
  {
    id: "Q-1",
    name: "feature/notifications",
    priority: "high",
    estimatedTime: "~2m",
    aiScore: 94,
  },
  {
    id: "Q-2",
    name: "fix/ui-glitch",
    priority: "medium",
    estimatedTime: "~3m",
    aiScore: 76,
  },
  {
    id: "Q-3",
    name: "refactor/tests",
    priority: "low",
    estimatedTime: "~5m",
    aiScore: 45,
  },
];

export default function Overview() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [buildStats, setBuildStats] = useState(generateBuildStats());
  const [recentBuilds, setRecentBuilds] = useState(initialRecentBuilds);
  const [queuedBuilds, setQueuedBuilds] = useState(initialQueuedBuilds);
  const [totalBuilds, setTotalBuilds] = useState(187);
  const [passRate, setPassRate] = useState(94.7);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalBuilds((prev) => prev + Math.floor(Math.random() * 3));
      setPassRate((prev) =>
        Math.min(99, Math.max(85, prev + (Math.random() - 0.5) * 0.5))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setBuildStats(generateBuildStats());

    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Dashboard statistics have been updated.",
      });
    }, 1000);
  };

  const handleRetryBuild = (buildId: string) => {
    setRecentBuilds((prev) =>
      prev.map((b) =>
        b.id === buildId ? { ...b, status: "running", time: "Just now" } : b
      )
    );
    toast({
      title: "Build restarted",
      description: `Build ${buildId} has been queued for retry.`,
    });
  };

  const handleRunNext = () => {
    if (queuedBuilds.length === 0) return;

    const [next, ...rest] = queuedBuilds;
    setQueuedBuilds(rest);
    setRecentBuilds((prev) => [
      {
        id: `B-${Date.now()}`,
        name: next.name,
        status: "running",
        duration: "0s",
        time: "Just now",
        author: "You",
      },
      ...prev.slice(0, 4),
    ]);
    toast({
      title: "Build started",
      description: `${next.name} is now running.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "medium":
        return "bg-primary/20 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className='h-4 w-4 text-green-500' />;
      case "failed":
        return <XCircle className='h-4 w-4 text-destructive' />;
      case "running":
        return <Clock className='h-4 w-4 text-primary animate-pulse' />;
      default:
        return <Clock className='h-4 w-4 text-muted-foreground' />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-500/10 hover:bg-green-500/20";
      case "failed":
        return "bg-destructive/10 hover:bg-destructive/20";
      case "running":
        return "bg-primary/10 hover:bg-primary/20";
      default:
        return "bg-muted/50 hover:bg-muted";
    }
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
            Welcome back, {user?.first_name || "Developer"}! 👋
          </h1>
          <p className='text-muted-foreground'>
            Here's what's happening with your builds today.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RotateCcw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Badge variant='outline' className='bg-primary/10'>
            <Zap className='h-3 w-3 mr-1' />
            {user?.current_plan || "Starter"} Plan
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Builds Today
            </CardTitle>
            <Activity className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {totalBuilds}
            </div>
            <div className='flex items-center text-xs text-green-500 mt-1'>
              <ArrowUpRight className='h-3 w-3 mr-1' />
              +12% from yesterday
            </div>
            <div className='mt-3 h-1 bg-muted rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary rounded-full animate-pulse'
                style={{ width: "75%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Pass Rate
            </CardTitle>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {passRate.toFixed(1)}%
            </div>
            <Progress value={passRate} className='mt-2 h-2' />
            <p className='text-xs text-muted-foreground mt-2'>
              {Math.round((totalBuilds * passRate) / 100)} passed /{" "}
              {totalBuilds} total
            </p>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Queue Length
            </CardTitle>
            <Clock className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {queuedBuilds.length}
            </div>
            <p className='text-xs text-muted-foreground'>
              Est. wait: ~{queuedBuilds.length * 3} minutes
            </p>
            <Button
              size='sm'
              variant='outline'
              className='mt-3 w-full'
              onClick={handleRunNext}
              disabled={queuedBuilds.length === 0}
            >
              <Play className='h-3 w-3 mr-1' />
              Run Next
            </Button>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Failed Builds
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {recentBuilds.filter((b) => b.status === "failed").length}
            </div>
            <div className='flex items-center text-xs text-destructive mt-1'>
              <ArrowDownRight className='h-3 w-3 mr-1' />
              {recentBuilds.filter((b) => b.status === "failed").length > 0
                ? "Needs attention"
                : "All clear!"}
            </div>
            <Button
              size='sm'
              variant='destructive'
              className='mt-3 w-full opacity-90'
            >
              <Eye className='h-3 w-3 mr-1' />
              View Failures
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Build Activity</CardTitle>
            <CardDescription>
              Your build statistics over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={buildStats}>
                  <defs>
                    <linearGradient
                      id='colorPassed'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='hsl(142, 76%, 36%)'
                        stopOpacity={0.3}
                      />
                      <stop
                        offset='95%'
                        stopColor='hsl(142, 76%, 36%)'
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id='colorFailed'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='hsl(0, 84%, 60%)'
                        stopOpacity={0.3}
                      />
                      <stop
                        offset='95%'
                        stopColor='hsl(0, 84%, 60%)'
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='hsl(var(--border))'
                  />
                  <XAxis
                    dataKey='name'
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                  />
                  <YAxis stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='passed'
                    stroke='hsl(142, 76%, 36%)'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorPassed)'
                  />
                  <Area
                    type='monotone'
                    dataKey='failed'
                    stroke='hsl(0, 84%, 60%)'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorFailed)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Builds by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={hourlyData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='hsl(var(--border))'
                  />
                  <XAxis
                    dataKey='hour'
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={10}
                  />
                  <YAxis stroke='hsl(var(--muted-foreground))' fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey='builds'
                    fill='hsl(var(--primary))'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Builds & Queue */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Builds</CardTitle>
            <CardDescription>Your latest build results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentBuilds.map((build) => (
                <div
                  key={build.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${getStatusBg(
                    build.status
                  )}`}
                >
                  <div className='flex items-center gap-3'>
                    {getStatusIcon(build.status)}
                    <div>
                      <p className='text-sm font-medium text-foreground'>
                        {build.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {build.id} • {build.duration} • {build.author}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground'>
                      {build.time}
                    </span>
                    {build.status === "failed" && (
                      <Button
                        size='sm'
                        variant='ghost'
                        className='h-7 px-2'
                        onClick={() => handleRetryBuild(build.id)}
                      >
                        <RotateCcw className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-primary' />
              AI-Prioritized Queue
            </CardTitle>
            <CardDescription>
              Builds waiting to run, ordered by AI priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queuedBuilds.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <CheckCircle2 className='h-12 w-12 text-green-500 mb-3' />
                <p className='text-foreground font-medium'>Queue is empty!</p>
                <p className='text-sm text-muted-foreground'>
                  All builds have been processed.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {queuedBuilds.map((build, index) => (
                  <div
                    key={build.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-lg font-bold text-primary w-6'>
                        #{index + 1}
                      </span>
                      <div>
                        <p className='text-sm font-medium text-foreground'>
                          {build.name}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge
                            variant='outline'
                            className={getPriorityColor(build.priority)}
                          >
                            {build.priority}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>
                            AI:{" "}
                            <span className='font-semibold text-primary'>
                              {build.aiScore}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {build.estimatedTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
