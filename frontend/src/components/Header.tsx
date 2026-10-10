"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";

import { Suspense } from "react";

function HeaderContent() {
  const pathname = usePathname();
  const isAuth = pathname === "/";

  return (
    <header className="flex items-center justify-between gap-3 py-2 pb-5">
      <Link href="/" className="font-sora font-bold text-xl flex items-center gap-2 focus-ring rounded-md">
        <span className="w-7 h-7 rounded-[9px] bg-primary relative inline-block after:content-[''] after:absolute after:-right-1 after:-bottom-1 after:w-3 after:h-3 after:rounded-full after:bg-gold after:border-2 after:border-bg" />
        CollabPay
      </Link>
      
      <div className="flex gap-2 items-center">
        <ThemeToggle />
        {!isAuth && (
          <Link 
            href="/"
            className="bg-transparent border border-line text-ink rounded-button-sm px-3 py-1.5 text-[13px] font-semibold focus-ring"
          >
            Log out
          </Link>
        )}
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  );
}
