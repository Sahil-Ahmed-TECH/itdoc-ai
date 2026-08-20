import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/auth", replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-3">
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
    <User className="h-4 w-4" />
  </div>

  <div className="min-w-0 flex-1">
    <p
      title={email ?? "Signed in"}
      className="break-all text-xs font-semibold text-sidebar-foreground"
    >
      {email ?? "Signed in"}
    </p>

    <div className="mt-0.5 flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
        Service Desk
      </p>
    </div>
  </div>
</div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-60"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
