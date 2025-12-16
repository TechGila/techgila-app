import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser, removeAuthToken, setAuthToken } from "@/lib/api";

export default function AuthComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get("token");

    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Missing token from OAuth callback.",
      });
      navigate("/auth", { replace: true });
      return;
    }

    // Remove token from the URL as soon as we can.
    window.history.replaceState({}, document.title, "/auth/complete");

    (async () => {
      try {
        // Set token first so /user is authenticated.
        setAuthToken(token);

        const me = await getCurrentUser();
        const user = me.data?.user;

        if (me.status !== "success" || !user) {
          throw new Error(me.message || "Unable to load user profile");
        }

        login(token, user);

        toast({
          title: "Signed in",
          description: "Authentication successful. Redirecting to dashboard...",
        });

        navigate("/dashboard", { replace: true });
      } catch (err) {
        removeAuthToken();
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description:
            err instanceof Error ? err.message : "OAuth login failed.",
        });
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [login, navigate, searchParams, toast]);

  return (
    <div className='min-h-screen flex items-center justify-center p-8 bg-background'>
      <div className='w-full max-w-md'>
        <Card className='border-border/50'>
          <CardHeader>
            <CardTitle>Completing sign in…</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center gap-3 text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            {isLoading ? "Please wait" : "Done"}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
