"use client";

import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, FileText, Bell, Wallet, Compass, LogOut, Plus } from "lucide-react";

import { Suspense } from "react";

function ShellLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null; // handled by RouteGuard

  const brandNav = [
    { name: "Home", href: "/brand", icon: Home },
    { name: "Campaigns", href: "/brand/campaigns", icon: Briefcase },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const creatorNav = [
    { name: "Home", href: "/creator", icon: Home },
    { name: "Discover", href: "/creator/discover", icon: Compass },
    { name: "My Work", href: "/creator/my-work", icon: FileText },
    { name: "Wallet", href: "/creator/wallet", icon: Wallet },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const nav = user.role === "brand" ? brandNav : creatorNav;

  return (
    <RouteGuard>
      <div className="flex h-[100dvh] bg-bg overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-line py-6">
          <Link href={`/${user.role}`} className="px-6 mb-8 font-sora font-bold text-xl text-ink tracking-tight block">
            CollabPay
          </Link>
          <nav className="flex-1 px-4 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted hover:text-ink hover:bg-soft"}`}>
                  <item.icon className="w-5 h-5 stroke-[1.75]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 mt-auto">
            <div className="p-3 border border-line rounded-xl flex items-center justify-between bg-bg">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">{user.name}</div>
                <div className="text-xs text-muted capitalize">{user.role}</div>
              </div>
              <button onClick={logout} className="p-1.5 text-muted hover:text-bad rounded-md hover:bg-soft transition-colors" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile/Tablet Top Bar */}
          <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-line shrink-0">
            <Link href={`/${user.role}`} className="font-sora font-bold text-lg text-ink">
              CollabPay
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={logout} className="p-1.5 text-muted hover:text-bad rounded-md bg-soft" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Desktop Top Bar */}
          <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-bg border-b border-line shrink-0">
            <h1 className="font-sora text-xl font-semibold text-ink">
              {nav.find(n => n.href === pathname)?.name || "Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              {process.env.NODE_ENV !== "production" && (
                <span className="text-xs font-medium px-2 py-1 bg-soft border border-line rounded-md text-muted">Dev Mode</span>
              )}
              <ThemeToggle />
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-bg pb-20 lg:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile/Tablet Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line flex justify-around items-center h-[env(safe-area-inset-bottom,60px)] pb-[env(safe-area-inset-bottom,0px)] px-2 z-50">
          {user.role === "brand" ? (
            <>
              <Link href="/brand/campaigns" className={`flex flex-col items-center justify-center w-full py-2 ${pathname.startsWith("/brand/campaigns") && pathname !== "/brand/campaigns/new" ? "text-primary" : "text-muted hover:text-ink"}`}>
                <Briefcase className={`w-5 h-5 mb-1 stroke-[1.75] ${pathname.startsWith("/brand/campaigns") && pathname !== "/brand/campaigns/new" ? "fill-primary/20" : ""}`} />
                <span className="text-[10px] font-medium">Campaigns</span>
              </Link>
              <Link href="/brand/campaigns/new" className="flex flex-col items-center justify-center w-full py-2 group">
                <div className="bg-primary text-white p-3 rounded-full shadow-md transition-opacity -mt-6 border-4 border-surface">
                  <Plus className="w-5 h-5" />
                </div>
              </Link>
              <Link href="/notifications" className={`flex flex-col items-center justify-center w-full py-2 ${pathname === "/notifications" ? "text-primary" : "text-muted hover:text-ink"}`}>
                <Bell className={`w-5 h-5 mb-1 stroke-[1.75] ${pathname === "/notifications" ? "fill-primary/20" : ""}`} />
                <span className="text-[10px] font-medium">Alerts</span>
              </Link>
            </>
          ) : (
            creatorNav.slice(0, 4).map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full py-2 ${active ? "text-primary" : "text-muted hover:text-ink"}`}>
                  <item.icon className={`w-5 h-5 mb-1 stroke-[1.75] ${active ? "fill-primary/20" : ""}`} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </RouteGuard>
  );
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ShellLayoutContent>{children}</ShellLayoutContent>
    </Suspense>
  );
}
