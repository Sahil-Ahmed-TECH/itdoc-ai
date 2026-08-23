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
  viewBox="0 0 50 28"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  <g
    fill="none"
    stroke="currentColor"
    strokeWidth="0.08"
    className="text-primary"
    strokeLinecap="round"
  >
    {/* Primary network paths */}
    <path d="M7 7 L13 5 L20 9 L27 6 L34 10" />
    <path d="M13 5 L15 12 L20 9" />
    <path d="M20 9 L24 15 L34 10" />

    {/* Secondary network paths */}
    <path d="M15 12 L19 19 L26 17 L34 10" />
    <path d="M24 15 L26 17 L33 22" />
    <path d="M26 17 L37 19 L43 15" />
    <path d="M34 10 L38 12 L43 15" />

    {/* Peripheral connections */}
    <path d="M7 7 L4 11" />
    <path d="M19 19 L16 24" />
    <path d="M33 22 L38 24" />
    <path d="M43 15 L47 10" />
  </g>

  <g className="fill-primary">
    {/* Primary nodes */}
    <circle cx="13" cy="5" r="0.12" />
    <circle cx="20" cy="9" r="0.12" />
    <circle cx="27" cy="6" r="0.12" />
    <circle cx="34" cy="10" r="0.12" />

    {/* Secondary nodes */}
    <circle cx="15" cy="12" r="0.1" />
    <circle cx="24" cy="15" r="0.1" />
    <circle cx="26" cy="17" r="0.12" />
    <circle cx="37" cy="19" r="0.1" />
    <circle cx="38" cy="12" r="0.1" />

    {/* Peripheral nodes */}
    <circle cx="7" cy="7" r="0.1" />
    <circle cx="4" cy="11" r="0.08" />
    <circle cx="19" cy="19" r="0.1" />
    <circle cx="16" cy="24" r="0.08" />
    <circle cx="33" cy="22" r="0.1" />
    <circle cx="38" cy="24" r="0.08" />
    <circle cx="43" cy="15" r="0.1" />
    <circle cx="47" cy="10" r="0.08" />
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
