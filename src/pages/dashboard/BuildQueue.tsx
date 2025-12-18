import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/contexts/AutoRefreshContext";
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
  Clock,
  GitBranch,
  User,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Trash2,
  GripVertical,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// Demo queue data
const initialQueueData = [
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
  {
    id: "Q-007",
    branch: "fix/mobile-layout",
    author: "Taylor Reed",
    priority: "low",
    aiScore: 38,
    estimatedTime: "2m 45s",
    position: 7,
    tests: 45,
    changes: 15,
    triggeredAt: "45 min ago",
  },
  {
    id: "Q-008",
    branch: "feature/export-csv",
    author: "Morgan Lee",
    priority: "medium",
    aiScore: 71,
    estimatedTime: "3m 05s",
    position: 8,
    tests: 98,
    changes: 22,
    triggeredAt: "52 min ago",
  },
];

export default function BuildQueue() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isPaused, setIsPaused] = useState(false);
  const [queueData, setQueueData] = useState(initialQueueData);
  const [isReprioritizing, setIsReprioritizing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentlyRunning, setCurrentlyRunning] = useState<string | null>(null);

  // Simulate running build progress (respects auto-refresh setting)
  const { enabled: autoRefreshEnabled, intervalSeconds } = useAutoRefresh();

  useEffect(() => {
    if (isPaused || queueData.length === 0 || !autoRefreshEnabled) return;

    const runNextBuild = () => {
      if (queueData.length > 0 && !currentlyRunning) {
        const nextBuild = queueData[0];
        setCurrentlyRunning(nextBuild.id);

        // Simulate build completion
        setTimeout(() => {
          setQueueData((prev) =>
            prev.filter((item) => item.id !== nextBuild.id)
          );
          setCurrentlyRunning(null);
          toast({
            title: "Build completed",
            description: `${nextBuild.branch} finished successfully.`,
          });
          // Add a global notification as well
          try {
            window.dispatchEvent(
              new CustomEvent("notification:add", {
                detail: {
                  title: "Build completed",
                  description: `${nextBuild.branch} finished successfully.`,
                },
              })
            );
          } catch (e) {
            console.warn("notification dispatch failed", e);
          }
        }, 4000);
      }
    };

    const interval = setInterval(
      runNextBuild,
      Math.max(1000, intervalSeconds * 1000)
    );
    return () => clearInterval(interval);
  }, [
    isPaused,
    queueData,
    currentlyRunning,
    toast,
    autoRefreshEnabled,
    intervalSeconds,
  ]);

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: "bg-destructive/20 text-destructive border-destructive/30",
      high: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      medium: "bg-primary/20 text-primary border-primary/30",
      low: "bg-muted text-muted-foreground border-border",
    };
    return styles[priority] || styles.low;
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-orange-500";
    return "text-muted-foreground";
  };

  const filteredQueue = queueData.filter((item) => {
    const matchesSearch =
      item.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Queue resumed" : "Queue paused",
      description: isPaused
        ? "Builds will continue processing."
        : "No new builds will start until resumed.",
    });
  };

  const handleReprioritize = () => {
    setIsReprioritizing(true);
    setTimeout(() => {
      const reshuffled = [...queueData].sort((a, b) => b.aiScore - a.aiScore);
      setQueueData(
        reshuffled.map((item, index) => ({ ...item, position: index + 1 }))
      );
      setIsReprioritizing(false);
      toast({
        title: "Queue re-prioritized",
        description: "AI has recalculated optimal build order.",
      });
    }, 1500);
  };

  const handleMoveUp = (id: string) => {
    const index = queueData.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const newData = [...queueData];
    [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
    setQueueData(newData.map((item, i) => ({ ...item, position: i + 1 })));
  };

  const handleMoveDown = (id: string) => {
    const index = queueData.findIndex((item) => item.id === id);
    if (index >= queueData.length - 1) return;

    const newData = [...queueData];
    [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
    setQueueData(newData.map((item, i) => ({ ...item, position: i + 1 })));
  };

  const handleRemove = (id: string) => {
    setQueueData((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Build removed",
      description: "The build has been removed from the queue.",
      variant: "destructive",
    });
  };

  const handleRunNow = useCallback(
    (id: string) => {
      const item = queueData.find((q) => q.id === id);
      if (!item) return;

      setCurrentlyRunning(id);
      toast({
        title: "Build started",
        description: `${item.branch} is now running.`,
      });

      setTimeout(() => {
        setQueueData((prev) => prev.filter((q) => q.id !== id));
        setCurrentlyRunning(null);
        toast({
          title: "Build completed",
          description: `${item.branch} finished successfully.`,
        });
        try {
          window.dispatchEvent(
            new CustomEvent("notification:add", {
              detail: {
                title: "Build completed",
                description: `${item.branch} finished successfully.`,
              },
            })
          );
        } catch (e) {
          console.warn("notification dispatch failed", e);
        }
      }, 3000);
    },
    [queueData, toast]
  );

  // Listen for global run-next shortcut (placed after handler to avoid "used before declaration")
  useEffect(() => {
    const handler = () => {
      if (queueData.length > 0 && !currentlyRunning && !isPaused) {
        const next = queueData[0];
        handleRunNow(next.id);
      }
    };
    window.addEventListener("global:run-next", handler as EventListener);
    return () =>
      window.removeEventListener("global:run-next", handler as EventListener);
  }, [handleRunNow, queueData, currentlyRunning, isPaused]);

  const totalEstTime = queueData.reduce((acc, item) => {
    const mins = parseInt(item.estimatedTime.split("m")[0]) || 0;
    return acc + mins;
  }, 0);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground flex items-center gap-2'>
            <Zap className='h-6 w-6 text-primary' />
            AI-Prioritized Build Queue
          </h1>
          <p className='text-muted-foreground'>
            Builds are automatically ordered by AI-calculated priority scores
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant={isPaused ? "default" : "outline"}
            onClick={handleTogglePause}
          >
            {isPaused ? (
              <>
                <Play className='h-4 w-4 mr-2' />
                Resume Queue
              </>
            ) : (
              <>
                <Pause className='h-4 w-4 mr-2' />
                Pause Queue
              </>
            )}
          </Button>
          <Button
            variant='outline'
            onClick={handleReprioritize}
            disabled={isReprioritizing}
          >
            <RotateCcw
              className={`h-4 w-4 mr-2 ${
                isReprioritizing ? "animate-spin" : ""
              }`}
            />
            Re-prioritize
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              const csv = [
                [
                  "id",
                  "branch",
                  "author",
                  "priority",
                  "aiScore",
                  "est_time",
                  "tests",
                ],
                ...queueData.map((q) => [
                  q.id,
                  q.branch,
                  q.author,
                  q.priority,
                  String(q.aiScore),
                  q.estimatedTime,
                  String(q.tests),
                ]),
              ]
                .map((r) =>
                  r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `build-queue-${Date.now()}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              toast({
                title: "Export started",
                description: "Downloading queue CSV.",
              });
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {isPaused && (
        <div className='bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-center gap-3'>
          <AlertCircle className='h-5 w-5 text-orange-500' />
          <div>
            <p className='font-medium text-orange-500'>Queue is paused</p>
            <p className='text-sm text-muted-foreground'>
              New builds will not start until the queue is resumed.
            </p>
          </div>
        </div>
      )}

      {/* AI Explanation Card */}
      <Card className='bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
              <Sparkles className='h-5 w-5 text-primary' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-foreground mb-1'>
                How AI Prioritization Works
              </h3>
              <p className='text-sm text-muted-foreground'>
                Our AI analyzes code changes, test coverage, historical failure
                rates, branch importance, and dependency impacts to calculate
                optimal build order. Critical hotfixes and high-impact changes
                are automatically prioritized.
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-muted-foreground'>Est. Total Time</p>
              <p className='text-2xl font-bold text-foreground'>
                ~{totalEstTime}m
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Management</CardTitle>
          <CardDescription>
            {filteredQueue.length} builds in queue
            {currentlyRunning && " • 1 currently running"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by branch or author...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by priority' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Priorities</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile list (stacked cards) */}
          <div className='block sm:hidden'>
            <ScrollArea className='space-y-3 max-h-[60vh] overflow-auto'>
              {filteredQueue.length === 0 ? (
                <div className='text-center py-6 text-muted-foreground'>
                  No builds in queue matching your criteria.
                </div>
              ) : (
                filteredQueue.map((item) => (
                  <Card
                    key={item.id}
                    className={`${
                      currentlyRunning === item.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-3'>
                            <div className='text-lg font-bold text-primary w-8'>
                              {item.position}
                            </div>
                            <div className='min-w-0'>
                              <p className='font-medium text-foreground truncate'>
                                {item.branch}
                              </p>
                              <p className='text-xs text-muted-foreground truncate'>
                                {item.triggeredAt} • {item.author}
                              </p>
                            </div>
                          </div>

                          <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                              <Clock className='h-4 w-4' />
                              <span>{item.estimatedTime}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Sparkles className='h-4 w-4' />
                              <span
                                className={`font-semibold ${getAIScoreColor(
                                  item.aiScore
                                )}`}
                              >
                                {item.aiScore}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-foreground'>
                                {item.tests} tests
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant='outline'
                                className={getPriorityBadge(item.priority)}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col items-end gap-2'>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={() => handleMoveUp(item.id)}
                              disabled={item.position === 1}
                            >
                              <ChevronUp className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={() => handleMoveDown(item.id)}
                              disabled={item.position === queueData.length}
                            >
                              <ChevronDown className='h-4 w-4' />
                            </Button>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-green-500 hover:text-green-600'
                              onClick={() => handleRunNow(item.id)}
                              disabled={currentlyRunning !== null}
                            >
                              <Play className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive hover:text-destructive'
                              onClick={() => handleRemove(item.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Queue Table (desktop) */}
          <div className='hidden sm:block rounded-lg border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='w-12'></TableHead>
                  <TableHead className='w-16'>#</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>
                    <div className='flex items-center gap-1'>
                      <Sparkles className='h-4 w-4' />
                      AI Score
                    </div>
                  </TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className='text-center py-8 text-muted-foreground'
                    >
                      No builds in queue matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueue.map((item) => (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-muted/30 ${
                        currentlyRunning === item.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <TableCell>
                        <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab' />
                      </TableCell>
                      <TableCell>
                        <span className='text-lg font-bold text-primary'>
                          {item.position}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <GitBranch className='h-4 w-4 text-muted-foreground' />
                          <div>
                            <p className='font-medium text-foreground'>
                              {item.branch}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {item.triggeredAt}
                              {currentlyRunning === item.id && (
                                <Badge className='ml-2 bg-primary/20 text-primary'>
                                  Running
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-muted-foreground' />
                          <span className='text-foreground'>{item.author}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={getPriorityBadge(item.priority)}
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${getAIScoreColor(
                            item.aiScore
                          )}`}
                        >
                          {item.aiScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-muted-foreground'>
                          <Clock className='h-4 w-4' />
                          {item.estimatedTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='text-foreground'>{item.tests}</span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => handleMoveUp(item.id)}
                            disabled={item.position === 1}
                          >
                            <ChevronUp className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => handleMoveDown(item.id)}
                            disabled={item.position === queueData.length}
                          >
                            <ChevronDown className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-green-500 hover:text-green-600'
                            onClick={() => handleRunNow(item.id)}
                            disabled={currentlyRunning !== null}
                          >
                            <Play className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-destructive hover:text-destructive'
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
