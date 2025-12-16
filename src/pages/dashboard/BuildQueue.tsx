import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Search,
  ArrowUpDown,
  Clock,
  GitBranch,
  User,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";

// Demo queue data
const queueData = [
  {
    id: "Q-001",
    branch: "feature/user-authentication",
    author: "Sarah Chen",
    priority: "critical",
    aiScore: 98,
    estimatedTime: "2m 15s",
    position: 1,
    tests: 142,
    changes: 23,
    triggeredAt: "2 min ago",
  },
  {
    id: "Q-002",
    branch: "hotfix/payment-processing",
    author: "Mike Johnson",
    priority: "high",
    aiScore: 94,
    estimatedTime: "1m 45s",
    position: 2,
    tests: 89,
    changes: 8,
    triggeredAt: "5 min ago",
  },
  {
    id: "Q-003",
    branch: "feature/dashboard-charts",
    author: "Emily Davis",
    priority: "medium",
    aiScore: 76,
    estimatedTime: "3m 20s",
    position: 3,
    tests: 234,
    changes: 45,
    triggeredAt: "12 min ago",
  },
  {
    id: "Q-004",
    branch: "fix/api-rate-limiting",
    author: "Alex Kim",
    priority: "high",
    aiScore: 88,
    estimatedTime: "2m 00s",
    position: 4,
    tests: 56,
    changes: 12,
    triggeredAt: "18 min ago",
  },
  {
    id: "Q-005",
    branch: "refactor/database-queries",
    author: "Jordan Smith",
    priority: "low",
    aiScore: 45,
    estimatedTime: "5m 30s",
    position: 5,
    tests: 312,
    changes: 67,
    triggeredAt: "25 min ago",
  },
  {
    id: "Q-006",
    branch: "feature/notifications",
    author: "Casey Brown",
    priority: "medium",
    aiScore: 62,
    estimatedTime: "4m 10s",
    position: 6,
    tests: 178,
    changes: 34,
    triggeredAt: "32 min ago",
  },
];

export default function BuildQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isPaused, setIsPaused] = useState(false);

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: "bg-destructive/20 text-destructive border-destructive/30",
      high: "bg-secondary/20 text-secondary border-secondary/30",
      medium: "bg-primary/20 text-primary border-primary/30",
      low: "bg-muted text-muted-foreground border-border",
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-secondary";
    return "text-muted-foreground";
  };

  const filteredQueue = queueData.filter((item) => {
    const matchesSearch =
      item.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            AI-Prioritized Build Queue
          </h1>
          <p className="text-muted-foreground">
            Builds are automatically ordered by AI-calculated priority scores
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isPaused ? "default" : "outline"}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Queue
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Queue
              </>
            )}
          </Button>
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Re-prioritize
          </Button>
        </div>
      </div>

      {/* AI Explanation Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">How AI Prioritization Works</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes multiple factors including code changes, test coverage, historical failure rates,
                branch importance, and dependency impacts to calculate optimal build order. Critical hotfixes and
                high-impact changes are automatically prioritized.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Management</CardTitle>
          <CardDescription>{filteredQueue.length} builds in queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by branch or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Queue Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      AI Score
                    </div>
                  </TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <span className="text-lg font-bold text-primary">{item.position}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{item.branch}</p>
                          <p className="text-xs text-muted-foreground">{item.triggeredAt}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{item.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityBadge(item.priority)}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getAIScoreColor(item.aiScore)}`}>
                        {item.aiScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {item.estimatedTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground">{item.tests}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
