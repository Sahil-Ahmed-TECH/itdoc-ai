import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
  <QueryClientProvider client={queryClient}>
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 overflow-hidden"
>
  {/* Technical grid */}
  <div
    className="absolute inset-0 text-foreground opacity-[0.05]"
    style={{
      backgroundImage:
        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      maskImage:
        "radial-gradient(ellipse at center, black 0%, black 45%, transparent 85%)",
      WebkitMaskImage:
        "radial-gradient(ellipse at center, black 0%, black 45%, transparent 85%)",
    }}
  />

  {/* Network topology */}
  <svg
    className="absolute inset-0 h-full w-full opacity-[0.10]"
    viewBox="0 0 1600 900"
    preserveAspectRatio="none"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-primary"
    >
      <path d="M120 180 L360 120 L570 250 L820 170 L1060 300 L1320 180" />
      <path d="M360 120 L420 380 L650 470 L820 170" />
      <path d="M570 250 L650 470 L930 520 L1060 300" />
      <path d="M820 170 L930 520 L1180 650 L1420 480" />
      <path d="M650 470 L500 700 L780 760 L1180 650" />
      <path d="M1060 300 L1240 400 L1420 480" />
    </g>

    <g className="fill-primary">
      <circle cx="120" cy="180" r="3" />
      <circle cx="360" cy="120" r="3" />
      <circle cx="570" cy="250" r="3" />
      <circle cx="820" cy="170" r="3" />
      <circle cx="1060" cy="300" r="3" />
      <circle cx="1320" cy="180" r="3" />
      <circle cx="420" cy="380" r="2.5" />
      <circle cx="650" cy="470" r="3" />
      <circle cx="930" cy="520" r="2.5" />
      <circle cx="1180" cy="650" r="3" />
      <circle cx="1420" cy="480" r="3" />
      <circle cx="500" cy="700" r="2.5" />
      <circle cx="780" cy="760" r="3" />
      <circle cx="1240" cy="400" r="2.5" />
    </g>
  </svg>
</div>

      <div className="relative">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </div>
    </div>

    <Toaster position="top-right" theme="dark" />
  </QueryClientProvider>
);
}
