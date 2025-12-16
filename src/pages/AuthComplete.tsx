import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentUser,
  removeAuthToken,
  setAuthToken,
  type ApiResponse,
} from "@/lib/api";

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

        // Try fetching the current user, retry once after a short delay if it fails.
        let me = await getCurrentUser();

        // If unauthenticated, attempt an explicit fetch to debug whether the
        // Authorization header with the token is being accepted by the backend.
        if (me.status === "error" && me.code === 401) {
          try {
            // Show partial token in console for debugging (not full token)
            const shortToken = token.slice(0, 10) + "...";
            console.debug(
              "AuthComplete: token set, attempting manual /user fetch with token:",
              shortToken
            );

            const raw = await fetch("https://api.techgila.com/user", {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "omit",
            });

            let rawBody: any = null;
            try {
              rawBody = await raw.json();
            } catch (e) {
              rawBody = await raw.text();
            }
            console.debug(
              "AuthComplete: manual /user fetch result",
              raw.status,
              rawBody
            );
          } catch (e) {
            console.debug("AuthComplete: manual fetch error", e);
          }
        }
        if (me.status !== "success" || !me.data?.user) {
          // wait briefly, backend might still finalize session
          await new Promise((r) => setTimeout(r, 500));
          me = await getCurrentUser();
        }

        const user = me.data?.user;

        if (me.status !== "success" || !user) {
          // Log the full response to console for debugging
          console.error("AuthComplete: getCurrentUser failed", me);
          removeAuthToken();
          let desc = "Unable to load user profile";
          if (me && typeof me === "object" && "message" in me) {
            const m = me as ApiResponse;
            desc = `${m.message} (code: ${m.code ?? "?"})`;
          }
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: desc,
          });
          navigate("/auth", { replace: true });
          return;
        }

        login(token, user);

        toast({
          title: "Signed in",
          description: "Authentication successful. Redirecting to dashboard...",
        });

        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("AuthComplete: unexpected error", err);
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
