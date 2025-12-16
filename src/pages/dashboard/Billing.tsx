import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPayments, subscribeToplan, type Payment } from "@/lib/api";
import { DEMO_SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const currentPlanSlug = user?.current_plan || "starter";
  const currentPlan = DEMO_SUBSCRIPTION_PLANS.find((p) => p.slug === currentPlanSlug);

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case "starter":
        return <Zap className="h-6 w-6" />;
      case "professional":
        return <Crown className="h-6 w-6" />;
      case "enterprise":
        return <Building2 className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/30">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                {getPlanIcon(currentPlanSlug)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{currentPlan?.name || "Starter"}</h3>
                <p className="text-muted-foreground">{currentPlan?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">
                ${currentPlan?.price || "0"}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {DEMO_SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = plan.slug === currentPlanSlug;
            const isProfessional = plan.slug === "professional";

            return (
              <Card
                key={plan.slug}
                className={`relative ${
                  isProfessional ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                } ${isCurrentPlan ? "bg-muted/50" : ""}`}
              >
                {isProfessional && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4 text-primary">
                    {getPlanIcon(plan.slug)}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                    {plan.trial_days > 0 && (
                      <p className="text-sm text-primary mt-1">{plan.trial_days}-day free trial</p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Dialog open={isDialogOpen && selectedPlan === plan.slug} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? "outline" : isProfessional ? "default" : "secondary"}
                        disabled={isCurrentPlan}
                        onClick={() => {
                          setSelectedPlan(plan.slug);
                          setIsDialogOpen(true);
                        }}
                      >
                        {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upgrade to {plan.name}</DialogTitle>
                        <DialogDescription>
                          Enter your payment details to upgrade your plan.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardHolder">Cardholder Name</Label>
                          <Input
                            id="cardHolder"
                            placeholder="John Doe"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(e) => formatCardNumber(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryMonth">Month</Label>
                            <Input
                              id="expiryMonth"
                              placeholder="MM"
                              maxLength={2}
                              value={expiryMonth}
                              onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiryYear">Year</Label>
                            <Input
                              id="expiryYear"
                              placeholder="YY"
                              maxLength={2}
                              value={expiryYear}
                              onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              maxLength={4}
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            />
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-sm">
                          <p className="font-medium text-foreground">You'll be charged:</p>
                          <p className="text-2xl font-bold text-foreground">
                            ${plan.price} <span className="text-sm font-normal">/{plan.interval}</span>
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpgrade} disabled={isUpgrading}>
                          {isUpgrading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </div>
            <Button variant="outline" onClick={loadPaymentHistory} disabled={isLoadingPayments}>
              {isLoadingPayments ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Load History"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payment history yet</p>
              <p className="text-sm">Click "Load History" to fetch your transactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.type === "subscription" ? `${payment.plan_name} Plan` : payment.description || "Payment"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        •••• {payment.card_last_four} • {formatDate(payment.paid_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${payment.amount} {payment.currency}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        payment.status === "completed"
                          ? "bg-green-500/20 text-green-500 border-green-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
