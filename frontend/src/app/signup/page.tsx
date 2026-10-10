"use client";

import { useState, Suspense } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignupContent() {
  const searchParams = useSearchParams();
  const initRole = searchParams.get("role") === "brand" ? "brand" : "creator";
  
  const [role, setRole] = useState<"brand" | "creator">(initRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role, phone: phone || undefined })
      });
      login(res.token, res.user);
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex bg-bg">
      <div className="hidden lg:flex flex-1 bg-surface border-r border-line items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="font-sora text-4xl font-bold text-ink mb-4 tracking-tight">Join CollabPay</h1>
          <p className="text-lg text-muted">Reserve budgets, track every rupee, and collaborate seamlessly.</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-8 font-sora font-bold text-2xl text-ink">CollabPay</div>
          <h2 className="font-sora text-2xl font-bold text-ink mb-6">Create an account</h2>
          
          <div className="flex bg-soft p-1 rounded-lg mb-6 border border-line">
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${role === "creator" ? "bg-surface shadow-sm text-ink border border-line/50" : "text-muted hover:text-ink"}`}
              onClick={() => setRole("creator")}
            >
              Creator
            </button>
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${role === "brand" ? "bg-surface shadow-sm text-ink border border-line/50" : "text-muted hover:text-ink"}`}
              onClick={() => setRole("brand")}
            >
              Brand
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2 bg-surface border border-line rounded-lg text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-surface border border-line rounded-lg text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-surface border border-line rounded-lg text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              />
              <p className="text-xs text-muted mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Phone (Optional, for WhatsApp)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-line rounded-lg text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              />
            </div>
            {error && (
              <div className="text-sm text-bad bg-[color-mix(in_srgb,var(--bad)_16%,transparent)] px-4 py-3 rounded-lg border border-bad/30" role="alert" aria-live="polite">
                {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center h-10 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Sign up"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex bg-bg items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
