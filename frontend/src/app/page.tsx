import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Money } from "@/components/ui/Money";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-line">
        <div className="font-sora font-bold text-xl text-ink tracking-tight">CollabPay</div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-muted hover:text-ink transition-colors">Log in</Link>
          <Link href="/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Get started</Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="px-6 py-24 text-center max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-sora text-4xl sm:text-6xl font-bold text-ink mb-6 tracking-tight">
            Run campaigns. Pay creators.<br />Every rupee tracked.
          </h1>
          <p className="text-lg text-muted mb-10 max-w-2xl">
            The platform built for trust. Brands reserve budgets instantly, creators get paid reliably, and the ledger is immutable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Link href="/signup?role=brand" className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity">I am a Brand</Link>
            <Link href="/signup?role=creator" className="px-6 py-3 bg-surface border border-line text-ink font-medium rounded-lg hover:bg-soft transition-colors">I am a Creator</Link>
          </div>
          
          <div className="w-full max-w-sm mx-auto bg-surface border border-line rounded-2xl p-6 shadow-sm text-left">
            <div className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Payout Receipt</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-ink">Creator fee</span>
              <Money paise={500000} className="font-medium text-ink" />
            </div>
            <div className="flex justify-between items-center mb-4 text-bad">
              <span>TDS (1%)</span>
              <Money paise={-5000} />
            </div>
            <div className="h-px bg-line w-full mb-4" />
            <div className="flex justify-between items-center font-sora font-semibold">
              <span className="text-ink">Lands in wallet</span>
              <Money paise={495000} className="text-gold text-lg" />
            </div>
          </div>
        </section>
        
        <section className="px-6 py-24 bg-soft border-y border-line">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sora text-3xl font-bold text-ink mb-12 text-center">How it works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Create a campaign", desc: "Brands define budget and slots." },
                { step: "2", title: "Approve creators", desc: "Budget is reserved automatically." },
                { step: "3", title: "Review the post", desc: "Review and approve submissions." },
                { step: "4", title: "Get paid", desc: "Funds land securely in the wallet." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-surface border border-line rounded-full flex items-center justify-center font-sora font-bold text-lg text-primary mb-4">{item.step}</div>
                  <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 max-w-4xl mx-auto text-center">
          <h2 className="font-sora text-3xl font-bold text-ink mb-12">Built for trust</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-surface border border-line rounded-2xl">
              <h3 className="font-semibold text-ink mb-2">Reserved Budgets</h3>
              <p className="text-sm text-muted">When a creator is approved, their payout is instantly reserved. No more waiting for funds.</p>
            </div>
            <div className="p-6 bg-surface border border-line rounded-2xl">
              <h3 className="font-semibold text-ink mb-2">Immutable Ledger</h3>
              <p className="text-sm text-muted">Every transaction, TDS deduction, and fee is recorded immutably for full transparency.</p>
            </div>
            <div className="p-6 bg-surface border border-line rounded-2xl">
              <h3 className="font-semibold text-ink mb-2">Quiet Hours</h3>
              <p className="text-sm text-muted">No notifications between 9 PM and 9 AM IST. We respect your time off.</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 text-center text-sm text-muted border-t border-line">
        &copy; 2024 CollabPay. All rights reserved.
      </footer>
    </div>
  );
}
