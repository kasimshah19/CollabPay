"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [role, setRole] = useState<"brand" | "creator">("brand");
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(role === "brand" ? "/brand" : "/creator");
  };

  return (
    <main className="grid md:grid-cols-[1.1fr_1fr] gap-5 min-h-[540px]">
      <section className="bg-hero text-hero-ink rounded-hero p-9 flex flex-col justify-between overflow-hidden relative min-h-[340px]">
        <div>
          <h1 className="font-sora text-[clamp(28px,4.4vw,44px)] leading-[1.08] max-w-[11em] font-bold tracking-tight">
            Run campaigns. Pay creators. Every rupee tracked.
          </h1>
          <p className="text-hero-muted max-w-[28em] mt-4">
            Brands reserve budget when they approve. Creators see exactly what lands in the wallet before they apply.
          </p>
        </div>
        
        <div className="bg-surface text-ink rounded-2xl p-4 max-w-[300px] -rotate-2 shadow-receipt mt-8" aria-label="Sample payout breakdown">
          <div className="flex justify-between py-1 text-[13px]">
            <span>Creator fee</span>
            <span>₹5,000</span>
          </div>
          <div className="flex justify-between py-1 text-[13px]">
            <span>TDS 1%</span>
            <span>−₹50</span>
          </div>
          <div className="flex justify-between mt-1.5 pt-2 border-t-2 border-dashed border-line font-bold text-[15px]">
            <span>Lands in wallet</span>
            <span>₹4,950</span>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-line rounded-card p-[22px] flex flex-col gap-3.5 justify-center">
        <h2 className="font-sora font-bold text-2xl tracking-tight mb-2">Create your account</h2>
        
        <div className="inline-flex bg-soft rounded-[14px] p-1 gap-0.5 self-start mb-2" role="group" aria-label="Role">
          <button 
            aria-pressed={role === "brand"}
            onClick={() => setRole("brand")}
            className="border-0 bg-transparent text-muted px-4 py-2 rounded-button-sm font-semibold aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-soft focus-ring transition-colors"
          >
            Brand
          </button>
          <button 
            aria-pressed={role === "creator"}
            onClick={() => setRole("creator")}
            className="border-0 bg-transparent text-muted px-4 py-2 rounded-button-sm font-semibold aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-soft focus-ring transition-colors"
          >
            Creator
          </button>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="em" className="text-[13px] font-semibold text-muted block mb-1">Email</label>
            <input 
              id="em" 
              type="email" 
              defaultValue="kasim@example.com"
              className="w-full px-3.5 py-3 rounded-input border border-line bg-bg text-ink focus-ring font-inter"
            />
          </div>
          <div>
            <label htmlFor="pw" className="text-[13px] font-semibold text-muted block mb-1">Password</label>
            <input 
              id="pw" 
              type="password" 
              defaultValue="password123"
              className="w-full px-3.5 py-3 rounded-input border border-line bg-bg text-ink focus-ring font-inter"
            />
          </div>
          <button 
            type="submit"
            className="mt-2 border-0 rounded-button px-4 py-2.5 font-semibold bg-primary text-primary-ink focus-ring"
          >
            Sign up as {role === "brand" ? "Brand" : "Creator"}
          </button>
        </form>
        
        <p className="text-[12px] text-muted mt-2">Prototype only. Data lives in memory.</p>
      </section>
    </main>
  );
}
