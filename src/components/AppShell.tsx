import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  PenLine,
  Ticket,
  FileText,
  BookOpen,
  Menu,
  Zap,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#top" },
  { label: "Quick Capture", icon: PenLine, href: "#quick-capture" },
  { label: "Ticket Details", icon: Ticket, href: "#ticket-details" },
  { label: "Documentation", icon: FileText, href: "#documentation" },
  { label: "Knowledge Base", icon: BookOpen, href: "#knowledge-base" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight">ITDoc AI</p>
          <p className="text-[11px] text-sidebar-foreground/60">IT Documentation Toolkit</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Workspace
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <UserMenu />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">ITDoc AI</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
