import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPayments, subscribeToplan, type Payment } from "@/lib/api";
import { DEMO_SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Check,
  Zap,
  Crown,
  Building2,
  Loader2,
  Receipt,
  Calendar,
  Download,
  TrendingUp,
  Sparkles,
  Clock,
  Activity,
  BarChart2,
  ArrowUpRight,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  // Usage stats (demo data)
  const [usageStats] = useState({
    buildsUsed: 847,
    buildsLimit: 1000,
    testsRun: 12453,
    testsLimit: 20000,
    storageUsed: 4.2,
    storageLimit: 10,
    aiCredits: 750,
    aiCreditsLimit: 1000,
  });

  // Usage chart data
  const usageChartData = [
    { day: "Mon", builds: 45, tests: 890 },
    { day: "Tue", builds: 52, tests: 1120 },
    { day: "Wed", builds: 38, tests: 756 },
    { day: "Thu", builds: 65, tests: 1450 },
    { day: "Fri", builds: 71, tests: 1680 },
    { day: "Sat", builds: 23, tests: 420 },
    { day: "Sun", builds: 18, tests: 340 },
  ];

  const currentPlanSlug = user?.current_plan || "starter";
  const currentPlan = DEMO_SUBSCRIPTION_PLANS.find(
    (p) => p.slug === currentPlanSlug
  );

  // Filter plans by billing cycle
  const filteredPlans = DEMO_SUBSCRIPTION_PLANS.filter((plan) =>
    billingCycle === "monthly"
      ? plan.interval === "month"
      : plan.interval === "year"
  );

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case "starter":
        return <Zap className='h-6 w-6' />;
      case "professional":
        return <Crown className='h-6 w-6' />;
      case "enterprise":
        return <Building2 className='h-6 w-6' />;
      default:
        return <Zap className='h-6 w-6' />;
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setIsUpgrading(true);

    try {
      const response = await subscribeToplan(selectedPlan, {
        card_number: cardNumber.replace(/\s/g, ""),
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv,
        card_holder: cardHolder,
      });

      if (response.status === "success") {
        await refreshUser();
        toast({
          title: "Plan upgraded!",
          description: `You are now on the ${selectedPlan} plan.`,
        });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast({
          variant: "destructive",
          title: "Upgrade failed",
          description: response.message || "Payment processing failed.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process upgrade. Please try again.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setCardHolder("");
    setExpiryMonth("");
    setExpiryYear("");
    setCvv("");
    setSelectedPlan(null);
  };

  const loadPaymentHistory = async () => {
    setIsLoadingPayments(true);
    try {
      const response = await getPayments();
      if (response.status === "success" && response.data?.payments) {
        setPayments(response.data.payments);
      }
    } catch {
      // Silent fail for demo
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  return (
    <div className='space-y-6 max-w-6xl'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground flex items-center gap-2'>
            <CreditCard className='h-6 w-6 text-primary' />
            Billing & Plans
          </h1>
          <p className='text-muted-foreground'>
            Manage your subscription and payment methods
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() =>
            toast({
              title: "Invoice downloaded",
              description: "Your invoice has been downloaded.",
            })
          }
        >
          <Download className='h-4 w-4 mr-2' />
          Download Invoice
        </Button>
      </div>

      {/* Current Plan Overview */}
      <Card className='bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/30'>
        <CardContent className='pt-6'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-primary'>
                {getPlanIcon(currentPlanSlug)}
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h3 className='text-xl font-bold text-foreground'>
                    {currentPlan?.name || "Starter"}
                  </h3>
                  <Badge
                    variant='outline'
                    className='bg-green-500/20 text-green-500 border-green-500/30'
                  >
                    Active
                  </Badge>
                </div>
                <p className='text-muted-foreground'>
                  {currentPlan?.description}
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  <Clock className='h-3 w-3 inline mr-1' />
                  Renews on{" "}
                  {new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-4xl font-bold text-foreground'>
                ${currentPlan?.price || "0"}
                <span className='text-sm font-normal text-muted-foreground'>
                  /{currentPlan?.interval || "month"}
                </span>
              </p>
              <Button
                variant='outline'
                className='mt-2'
                onClick={() =>
                  toast({
                    title: "Manage subscription",
                    description: "Opening subscription settings...",
                  })
                }
              >
                Manage Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm text-muted-foreground'>Builds This Month</p>
              <Activity className='h-4 w-4 text-primary' />
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {usageStats.buildsUsed.toLocaleString()}
            </p>
            <Progress
              value={(usageStats.buildsUsed / usageStats.buildsLimit) * 100}
              className='mt-2 h-2'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {usageStats.buildsLimit - usageStats.buildsUsed} remaining of{" "}
              {usageStats.buildsLimit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm text-muted-foreground'>Tests Run</p>
              <BarChart2 className='h-4 w-4 text-green-500' />
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {usageStats.testsRun.toLocaleString()}
            </p>
            <Progress
              value={(usageStats.testsRun / usageStats.testsLimit) * 100}
              className='mt-2 h-2'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {usageStats.testsLimit - usageStats.testsRun} remaining of{" "}
              {usageStats.testsLimit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm text-muted-foreground'>Storage Used</p>
              <Shield className='h-4 w-4 text-orange-500' />
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {usageStats.storageUsed} GB
            </p>
            <Progress
              value={(usageStats.storageUsed / usageStats.storageLimit) * 100}
              className='mt-2 h-2'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {(usageStats.storageLimit - usageStats.storageUsed).toFixed(1)} GB
              remaining of {usageStats.storageLimit} GB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm text-muted-foreground'>AI Credits</p>
              <Sparkles className='h-4 w-4 text-purple-500' />
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {usageStats.aiCredits.toLocaleString()}
            </p>
            <Progress
              value={(usageStats.aiCredits / usageStats.aiCreditsLimit) * 100}
              className='mt-2 h-2'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {usageStats.aiCreditsLimit - usageStats.aiCredits} remaining of{" "}
              {usageStats.aiCreditsLimit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-primary' />
            Usage Overview
          </CardTitle>
          <CardDescription>
            Your resource usage over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[250px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={usageChartData}>
                <defs>
                  <linearGradient id='colorBuilds' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='hsl(var(--primary))'
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='95%'
                      stopColor='hsl(var(--primary))'
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                <Area
                  type='monotone'
                  dataKey='builds'
                  stroke='hsl(var(--primary))'
                  fillOpacity={1}
                  fill='url(#colorBuilds)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-foreground'>
            Available Plans
          </h2>
          <div className='flex items-center gap-2 bg-muted rounded-lg p-1'>
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              size='sm'
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "annual" ? "default" : "ghost"}
              size='sm'
              onClick={() => setBillingCycle("annual")}
            >
              Annual
              <Badge className='ml-2 bg-green-500/20 text-green-500'>
                Save 20%
              </Badge>
            </Button>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {filteredPlans.map((plan) => {
            const isCurrentPlan = plan.slug === currentPlanSlug;
            const isProfessional = plan.slug.includes("professional");

            return (
              <Card
                key={plan.slug}
                className={`relative transition-all hover:shadow-lg ${
                  isProfessional
                    ? "border-primary shadow-lg shadow-primary/20 scale-105"
                    : "border-border hover:border-primary/50"
                } ${isCurrentPlan ? "bg-muted/50" : ""}`}
              >
                {isProfessional && (
                  <Badge className='absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground'>
                    <Sparkles className='h-3 w-3 mr-1' />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className='text-center pt-8'>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      isProfessional
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getPlanIcon(plan.slug)}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='text-center'>
                    <span className='text-4xl font-bold text-foreground'>
                      ${plan.price}
                    </span>
                    <span className='text-muted-foreground'>
                      /{plan.interval}
                    </span>
                    {plan.trial_days > 0 && (
                      <p className='text-sm text-primary mt-1'>
                        {plan.trial_days}-day free trial
                      </p>
                    )}
                  </div>

                  <ul className='space-y-3'>
                    {plan.features.map((feature, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <Check className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
                        <span className='text-sm text-foreground'>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Dialog
                    open={isDialogOpen && selectedPlan === plan.slug}
                    onOpenChange={setIsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className='w-full'
                        variant={
                          isCurrentPlan
                            ? "outline"
                            : isProfessional
                            ? "default"
                            : "secondary"
                        }
                        disabled={isCurrentPlan}
                        onClick={() => {
                          setSelectedPlan(plan.slug);
                          setIsDialogOpen(true);
                        }}
                      >
                        {isCurrentPlan ? (
                          <>
                            <Check className='h-4 w-4 mr-2' />
                            Current Plan
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className='h-4 w-4 mr-2' />
                            Upgrade to {plan.name}
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Upgrade to {plan.name}</DialogTitle>
                        <DialogDescription>
                          Enter your payment details to upgrade your plan.
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='cardHolder'>Cardholder Name</Label>
                          <Input
                            id='cardHolder'
                            placeholder='John Doe'
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='cardNumber'>Card Number</Label>
                          <div className='relative'>
                            <Input
                              id='cardNumber'
                              placeholder='4242 4242 4242 4242'
                              value={cardNumber}
                              onChange={(e) => formatCardNumber(e.target.value)}
                              className='pl-10'
                            />
                            <CreditCard className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='expiryMonth'>Month</Label>
                            <Input
                              id='expiryMonth'
                              placeholder='MM'
                              maxLength={2}
                              value={expiryMonth}
                              onChange={(e) =>
                                setExpiryMonth(
                                  e.target.value.replace(/\D/g, "").slice(0, 2)
                                )
                              }
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='expiryYear'>Year</Label>
                            <Input
                              id='expiryYear'
                              placeholder='YY'
                              maxLength={2}
                              value={expiryYear}
                              onChange={(e) =>
                                setExpiryYear(
                                  e.target.value.replace(/\D/g, "").slice(0, 2)
                                )
                              }
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='cvv'>CVV</Label>
                            <Input
                              id='cvv'
                              placeholder='123'
                              maxLength={4}
                              value={cvv}
                              onChange={(e) =>
                                setCvv(
                                  e.target.value.replace(/\D/g, "").slice(0, 4)
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className='bg-muted rounded-lg p-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='font-medium text-foreground'>
                                You'll be charged:
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Billed {plan.interval}ly
                              </p>
                            </div>
                            <p className='text-2xl font-bold text-foreground'>
                              ${plan.price}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <Shield className='h-4 w-4' />
                          Your payment is secured with 256-bit encryption
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant='outline'
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpgrade} disabled={isUpgrading}>
                          {isUpgrading ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className='h-4 w-4 mr-2' />
                              Confirm Upgrade
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Receipt className='h-5 w-5' />
                Payment History
              </CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </div>
            <Button
              variant='outline'
              onClick={loadPaymentHistory}
              disabled={isLoadingPayments}
            >
              {isLoadingPayments ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <>
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Load History
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              <Receipt className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='font-medium'>No payment history yet</p>
              <p className='text-sm'>
                Click "Load History" to fetch your transactions
              </p>
            </div>
          ) : (
            <div className='rounded-lg border border-border overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/50'>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
                            <CreditCard className='h-5 w-5 text-muted-foreground' />
                          </div>
                          <div>
                            <p className='font-medium text-foreground'>
                              {payment.type === "subscription"
                                ? `${payment.plan_name} Plan`
                                : payment.description || "Payment"}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Invoice #{payment.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {formatDate(payment.paid_at)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        •••• {payment.card_last_four}
                      </TableCell>
                      <TableCell className='font-semibold text-foreground'>
                        ${payment.amount} {payment.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={
                            payment.status === "completed"
                              ? "bg-green-500/20 text-green-500 border-green-500/30"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toast({ title: "Invoice downloaded" })}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
