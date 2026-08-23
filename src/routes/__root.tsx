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
    className="absolute inset-0 h-full w-full opacity-[0.08]"
    viewBox="0 0 1600 900"
    preserveAspectRatio="none"
  >
    <g
  fill="none"
  stroke="currentColor"
  strokeWidth="1"
  className="text-primary"
  strokeLinecap="round"
>
  {/* Primary network paths */}
  <path d="M210 230 L430 150 L650 280 L860 190 L1080 340" />
  <path d="M430 150 L470 390 L650 280" />
  <path d="M650 280 L760 500 L1080 340" />

  {/* Secondary network paths */}
  <path d="M470 390 L620 600 L850 560 L1080 340" />
  <path d="M760 500 L850 560 L1050 700" />
  <path d="M850 560 L1180 610 L1380 470" />
  <path d="M1080 340 L1210 390 L1380 470" />

  {/* Peripheral connections */}
  <path d="M210 230 L120 360" />
  <path d="M620 600 L500 760" />
  <path d="M1050 700 L1210 760" />
  <path d="M1380 470 L1490 330" />
</g>

<g className="fill-primary">
  {/* Primary nodes */}
  <circle cx="430" cy="150" r="3.5" />
  <circle cx="650" cy="280" r="3" />
  <circle cx="860" cy="190" r="3.5" />
  <circle cx="1080" cy="340" r="3" />

  {/* Secondary nodes */}
  <circle cx="470" cy="390" r="2.5" />
  <circle cx="760" cy="500" r="2.5" />
  <circle cx="850" cy="560" r="3" />
  <circle cx="1180" cy="610" r="2.5" />
  <circle cx="1210" cy="390" r="2.5" />

  {/* Peripheral nodes */}
  <circle cx="210" cy="230" r="2.5" />
  <circle cx="120" cy="360" r="2" />
  <circle cx="620" cy="600" r="2.5" />
  <circle cx="500" cy="760" r="2" />
  <circle cx="1050" cy="700" r="2.5" />
  <circle cx="1210" cy="760" r="2" />
  <circle cx="1380" cy="470" r="2.5" />
  <circle cx="1490" cy="330" r="2" />
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
