import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AuthComplete() {
  const navigate = useNavigate();
  const query = useQuery();
  const { completeOAuthLogin } = useAuth();
  const { toast } = useToast();
  const [didRun, setDidRun] = useState(false);

  useEffect(() => {
    if (didRun) return;
    setDidRun(true);

    const token = query.get("token") ?? query.get("api_token");

    if (!token) {
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: "Missing token from OAuth callback.",
      });
      navigate("/auth", { replace: true });
      return;
    }

    (async () => {
      const ok = await completeOAuthLogin(token);
      if (ok) {
        toast({
          title: "Signed in",
          description: "Your account is ready.",
        });
        navigate("/dashboard", { replace: true });
      } else {
        toast({
          variant: "destructive",
          title: "Sign-in failed",
          description: "Could not load your profile. Please try again.",
        });
        navigate("/auth", { replace: true });
      }
    })();
  }, [completeOAuthLogin, didRun, navigate, query, toast]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='text-muted-foreground'>Completing sign-in…</p>
      </div>
    </div>
  );
}
