import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/lib/auth-profile";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — ITDoc AI" },
      {
        name: "description",
        content:
          "Sign in or create an ITDoc AI account to generate professional IT service desk documentation.",
      },
      { property: "og:title", content: "Sign in — ITDoc AI" },
      {
        property: "og:description",
        content: "Access the ITDoc AI ticket documentation and knowledge base generator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email address, then sign in.";
  if (m.includes("user already registered"))
    return "An account with this email already exists — try signing in.";
  if (m.includes("password should be"))
    return "Password must be at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) navigate({ to: "/", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: fullName.trim() ? { full_name: fullName.trim() } : undefined,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          toast.success("Account created — confirm your email to continue.");
          return;
        }
        await ensureUserProfile(data.session.user);
        toast.success("Welcome to ITDoc AI");
        navigate({ to: "/", replace: true });
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      if (data.user) await ensureUserProfile(data.user);
      toast.success("Signed in");
      navigate({ to: "/", replace: true });
    } catch (err) {
      const message = friendlyError(err instanceof Error ? err.message : "Something went wrong.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border/70 bg-card/60 p-7 backdrop-blur">
        <span className="w-fit rounded-full border border-border bg-surface-elevated px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          IT Service Desk Toolkit
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to ITDoc AI" : "Create your ITDoc AI account"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {mode === "signin"
            ? "Use your work email and password to access the documentation generator."
            : "Sign up with an email and password to start generating documentation."}
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Joel Miller"
                autoComplete="name"
                className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joel.miller@company.com"
              autoComplete="email"
              className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-muted-foreground">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading
              ? mode === "signin"
                ? "Signing in…"
                : "Creating account…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-5 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin"
            ? "No account yet? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
