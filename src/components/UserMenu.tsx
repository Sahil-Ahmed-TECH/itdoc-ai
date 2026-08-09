import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {email && (
        <span className="max-w-[220px] truncate rounded-full border border-border bg-surface-elevated px-3 py-1">
          {email}
        </span>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
