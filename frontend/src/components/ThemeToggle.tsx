"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Read the theme that was applied by the inline head script
    const syncTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
      if (current) setTheme(current);
    };
    
    // Defer the state update to avoid synchronous setState inside the effect body
    const timeoutId = setTimeout(syncTheme, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // ignore
    }
  };

  if (!theme) {
    return <button aria-label="Toggle theme" className="h-9 px-3 invisible border border-transparent">...</button>;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Toggle theme, current theme is ${theme}`}
      className="bg-transparent border border-line text-ink rounded-button-sm px-3 py-1.5 text-sm font-medium focus-ring hover:bg-soft transition-colors"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}
