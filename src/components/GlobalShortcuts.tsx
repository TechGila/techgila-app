import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function GlobalShortcuts() {
  const { toast } = useToast();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // don't trigger if focusing input or textarea
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      // 'r' for refresh, 'n' for run next
      if (e.key === "r") {
        window.dispatchEvent(new CustomEvent("global:refresh"));
        toast({
          title: "Refreshing",
          description: "Triggered global refresh (r)",
        });
      }
      if (e.key === "n") {
        window.dispatchEvent(new CustomEvent("global:run-next"));
        toast({ title: "Run next", description: "Triggered Run Next (n)" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toast]);

  return null;
}
