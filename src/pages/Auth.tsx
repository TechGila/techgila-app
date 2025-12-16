import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  login as apiLogin,
  register as apiRegister,
  subscribeToplan,
  getSubscriptionPlans,
  createSubscriptionPlan,
  type SubscriptionPlan,
} from "@/lib/api";
import {
  DEFAULT_PLAN_SLUG,
  DEMO_SUBSCRIPTION_PLANS,
} from "@/lib/subscription-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Zap, Shield, BarChart3, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

function normalizePlans(value: unknown): SubscriptionPlan[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as SubscriptionPlan[];
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const maybePlans = obj.plans ?? obj.subscription_plans;
    if (Array.isArray(maybePlans)) return maybePlans as SubscriptionPlan[];
  }
  return [];
}

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up form state
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpFirstName, setSignUpFirstName] = useState("");
  const [signUpLastName, setSignUpLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiLogin(signInEmail, signInPassword);

      if (response.status === "success" && response.data) {
        login(response.data.token, response.data.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: response.message || "Invalid credentials",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
      });
      return;
    }

    if (signUpPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRegister(
        signUpUsername,
        signUpFirstName,
        signUpLastName,
        signUpEmail,
        signUpPassword
      );

      if (response.status === "success" && response.data) {
        // Persist token first so authenticated calls (like /subscriptions) work.
        login(response.data.token, response.data.user);

        // Auto-detect available subscription plans; if none exist, best-effort seed
        // the default plan from DEMO_SUBSCRIPTION_PLANS, then assign a plan.
        try {
          const plansResponse = await getSubscriptionPlans();
          let availablePlans = normalizePlans(plansResponse.data);

          if (plansResponse.status === "success") {
            const direct = normalizePlans(plansResponse.data?.plans);
            if (direct.length > 0) availablePlans = direct;
          }

          if (availablePlans.length === 0) {
            const defaultPlan = DEMO_SUBSCRIPTION_PLANS.find(
              (p) => p.slug === DEFAULT_PLAN_SLUG
            );

            if (defaultPlan) {
              await createSubscriptionPlan({
                name: defaultPlan.name,
                slug: defaultPlan.slug,
                description: defaultPlan.description,
                price: defaultPlan.price,
                currency: defaultPlan.currency,
                interval: defaultPlan.interval,
                trial_days: defaultPlan.trial_days,
                features: defaultPlan.features,
                is_active: defaultPlan.is_active,
              });
            }

            const refetch = await getSubscriptionPlans();
            const refetchedPlans = normalizePlans(
              refetch.data?.plans ?? refetch.data
            );
            if (refetch.status === "success" && refetchedPlans.length > 0) {
              availablePlans = refetchedPlans;
            }
          }

          const hasDefault = availablePlans.some(
            (p) => p.slug === DEFAULT_PLAN_SLUG
          );
          const planSlugToAssign = hasDefault
            ? DEFAULT_PLAN_SLUG
            : availablePlans[0]?.slug ?? DEFAULT_PLAN_SLUG;

          await subscribeToplan(planSlugToAssign, {
            card_number: "4242424242424242",
            expiry_month: "12",
            expiry_year: "30",
            cvv: "123",
            card_holder: `${signUpFirstName} ${signUpLastName}`.trim(),
          });
        } catch {
          // Plan assignment is non-blocking (user can still proceed).
          console.log("Plan auto-assignment skipped");
        }

        toast({
          title: "Account created!",
          description:
            "Welcome to TechGila. Check your email to verify your account.",
        });
        navigate("/dashboard");
      } else {
        const errorMessages = response.errors
          ? Object.values(response.errors).flat().join(". ")
          : response.message;
        toast({
          variant: "destructive",
          title: "Registration failed",
          description:
            errorMessages || "Please check your information and try again.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left side - Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-card p-12 flex-col justify-between'>
        <div>
          <div className='flex items-center gap-3 mb-16'>
            <Logo />
          </div>

          <div className='space-y-8'>
            <h1 className='text-4xl font-bold text-card-foreground leading-tight'>
              AI-Powered Build Queue
              <br />
              <span className='text-primary'>Prioritization</span>
            </h1>
            <p className='text-muted-foreground text-lg max-w-md'>
              Automatically prioritize your build queue with intelligent AI that
              learns from your testing patterns.
            </p>
          </div>

          <div className='mt-12 space-y-6'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0'>
                <BarChart3 className='w-6 h-6 text-secondary' />
              </div>
              <div>
                <h3 className='font-semibold text-foreground'>
                  Smart Analytics
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Get deep insights into your test results and build patterns
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0'>
                <Shield className='w-6 h-6 text-accent' />
              </div>
              <div>
                <h3 className='font-semibold text-foreground'>
                  Enterprise Security
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Bank-grade encryption and security for your data
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className='text-muted-foreground text-sm'>
          ©{new Date().getFullYear()} TechGila. All rights reserved.
        </p>
      </div>

      {/* Right side - Auth Forms */}
      <div className='flex-1 flex items-center justify-center p-8 bg-background'>
        <div className='w-full max-w-md'>
          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-3 mb-8 justify-center'>
            <div className='w-10 h-10 rounded-lg bg-primary flex items-center justify-center'>
              <Zap className='w-6 h-6 text-primary-foreground' />
            </div>
            <span className='text-2xl font-bold text-foreground'>TechGila</span>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2 mb-8'>
              <TabsTrigger value='signin'>Sign In</TabsTrigger>
              <TabsTrigger value='signup'>Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value='signin'>
              <Card className='border-border/50'>
                <CardHeader className='space-y-1'>
                  <CardTitle className='text-2xl'>Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='signin-email'>Email</Label>
                      <Input
                        id='signin-email'
                        type='email'
                        placeholder='you@example.com'
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className='bg-muted/50'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='signin-password'>Password</Label>
                      <Input
                        id='signin-password'
                        type='password'
                        placeholder='••••••••'
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        className='bg-muted/50'
                      />
                    </div>
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='signup'>
              <Card className='border-border/50'>
                <CardHeader className='space-y-1'>
                  <CardTitle className='text-2xl'>Create an account</CardTitle>
                  <CardDescription>
                    Start your free trial today. No credit card required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='signup-firstname'>First Name</Label>
                        <Input
                          id='signup-firstname'
                          placeholder='John'
                          value={signUpFirstName}
                          onChange={(e) => setSignUpFirstName(e.target.value)}
                          required
                          className='bg-muted/50'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='signup-lastname'>Last Name</Label>
                        <Input
                          id='signup-lastname'
                          placeholder='Doe'
                          value={signUpLastName}
                          onChange={(e) => setSignUpLastName(e.target.value)}
                          className='bg-muted/50'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='signup-username'>Username</Label>
                      <Input
                        id='signup-username'
                        placeholder='johndoe'
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        required
                        className='bg-muted/50'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='signup-email'>Email</Label>
                      <Input
                        id='signup-email'
                        type='email'
                        placeholder='you@example.com'
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className='bg-muted/50'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='signup-password'>Password</Label>
                      <Input
                        id='signup-password'
                        type='password'
                        placeholder='••••••••'
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        className='bg-muted/50'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='signup-confirm-password'>
                        Confirm Password
                      </Label>
                      <Input
                        id='signup-confirm-password'
                        type='password'
                        placeholder='••••••••'
                        value={signUpConfirmPassword}
                        onChange={(e) =>
                          setSignUpConfirmPassword(e.target.value)
                        }
                        required
                        className='bg-muted/50'
                      />
                    </div>
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    <p className='text-xs text-muted-foreground text-center'>
                      By signing up, you agree to our Terms of Service and
                      Privacy Policy.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
