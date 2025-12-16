import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Demo data
const buildStats = [
  { name: "Mon", builds: 24, passed: 22, failed: 2 },
  { name: "Tue", builds: 32, passed: 28, failed: 4 },
  { name: "Wed", builds: 28, passed: 26, failed: 2 },
  { name: "Thu", builds: 45, passed: 40, failed: 5 },
  { name: "Fri", builds: 38, passed: 35, failed: 3 },
  { name: "Sat", builds: 12, passed: 12, failed: 0 },
  { name: "Sun", builds: 8, passed: 8, failed: 0 },
];

const recentBuilds = [
  { id: "B-1234", name: "feature/auth-flow", status: "passed", duration: "2m 34s", time: "2 min ago" },
  { id: "B-1233", name: "fix/payment-bug", status: "passed", duration: "1m 45s", time: "15 min ago" },
  { id: "B-1232", name: "main", status: "failed", duration: "3m 12s", time: "1 hour ago" },
  { id: "B-1231", name: "feature/dashboard", status: "passed", duration: "2m 08s", time: "2 hours ago" },
  { id: "B-1230", name: "hotfix/api", status: "running", duration: "1m 23s", time: "Running" },
];

const queuedBuilds = [
  { id: "Q-1", name: "feature/notifications", priority: "high", estimatedTime: "~2m" },
  { id: "Q-2", name: "fix/ui-glitch", priority: "medium", estimatedTime: "~3m" },
  { id: "Q-3", name: "refactor/tests", priority: "low", estimatedTime: "~5m" },
];

export default function Overview() {
  const { user } = useAuth();

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
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "running":
        return <Clock className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.first_name || "Developer"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your builds today.
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Zap className="h-3 w-3 mr-1" />
          {user?.current_plan || "Starter"} Plan
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Builds Today</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">187</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">94.7%</div>
            <Progress value={94.7} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Queue Length</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground">Est. wait: ~10 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Builds</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">10</div>
            <p className="text-xs text-muted-foreground">5 require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Build Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Build Activity</CardTitle>
            <CardDescription>Your build statistics over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={buildStats}>
                  <defs>
                    <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="passed"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorPassed)"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorFailed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Builds */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Builds</CardTitle>
            <CardDescription>Your latest build results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBuilds.map((build) => (
                <div key={build.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(build.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{build.name}</p>
                      <p className="text-xs text-muted-foreground">{build.id} • {build.duration}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{build.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Build Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI-Prioritized Queue
            </CardTitle>
            <CardDescription>Builds waiting to run, ordered by AI priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queuedBuilds.map((build, index) => (
                <div key={build.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{build.name}</p>
                      <Badge variant="outline" className={getPriorityColor(build.priority)}>
                        {build.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{build.estimatedTime}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
