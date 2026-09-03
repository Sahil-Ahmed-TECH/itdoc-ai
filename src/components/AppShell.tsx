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

function SidebarContent({
  onNavigate,
  activeSection,
  setActiveSection,
}: {
  onNavigate?: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
    <Zap className="h-5 w-5" />
  </div>

  <div className="min-w-0">
    <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
      ITDoc AI
    </p>
    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
      IT Documentation Toolkit
    </p>
  </div>
</div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
  <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/40">
    Workspace
  </p>

  <ul className="flex flex-col gap-1">
    {navItems.map((item) => (
      <li key={item.label}>
        <a
          href={item.href}
          onClick={() => {
  setActiveSection(item.href);
  onNavigate?.();
}}
          className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
  activeSection === item.href
    ? "bg-sidebar-accent text-sidebar-accent-foreground"
    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
}`}
        >
          <item.icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105" />
          <span>{item.label}</span>
        </a>
      </li>
    ))}
  </ul>
</nav>

      <div className="border-t border-sidebar-border/70 px-3 py-3.5">
  <UserMenu />
</div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#top");

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-[380px] shrink-0 border-r border-sidebar-border lg:block">
  <SidebarContent
    activeSection={activeSection}
    setActiveSection={setActiveSection}
  />
</aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
  <Zap className="h-4 w-4" />
</div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
  ITDoc AI
</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[380px] p-0">
  <SidebarContent
    onNavigate={() => setMobileOpen(false)}
    activeSection={activeSection}
    setActiveSection={setActiveSection}
  />
</SheetContent>
      </Sheet>
    </div>
  );
}
