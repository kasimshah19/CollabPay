"use client";

import { useState } from "react";
import { formatInr } from "@/utils/format";

type LedgerEntry = { t: string, a: number, d: string };

export default function CreatorDashboard() {
  const [bal, setBal] = useState(4950);
  const [ledger, setLedger] = useState<LedgerEntry[]>([
    { t: 'Payout · Glow Serum', a: 4950, d: 'Today' }
  ]);
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleWithdraw = () => {
    if (bal <= 0) return;
    const amount = bal;
    setLedger([{ t: 'Withdrawal · mock UPI', a: -amount, d: 'Just now' }, ...ledger]);
    setBal(0);
    showToast('Withdrawal requested');
  };

  const handleApply = () => {
    setApplied(true);
    showToast('Application sent');
  };

  return (
    <main>
      <h2 className="font-sora font-bold text-2xl tracking-tight mb-3">Creator dashboard</h2>
      
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-grid-gap">
        <section className="bg-hero text-hero-ink rounded-[24px] p-[26px] relative overflow-hidden">
          <div className="absolute -right-[50px] -top-[50px] w-[180px] h-[180px] rounded-full bg-primary opacity-[0.55]"></div>
          <div className="relative z-10">
            <small className="text-hero-muted block text-[13px] font-semibold mb-1">Wallet balance</small>
            <div className="font-sora font-bold text-[40px] tabular-money my-1 mb-3.5">{formatInr(bal)}</div>
            <button 
              onClick={handleWithdraw}
              disabled={bal <= 0}
              className="border-0 rounded-button px-4 py-2.5 font-semibold bg-gold text-gold-ink focus-ring disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Withdraw all
            </button>
          </div>
        </section>

        <section className="bg-surface border border-line rounded-card p-[22px]">
          <h3 className="font-sora font-bold text-[16px] tracking-tight mb-3">What you earn</h3>
          <div className="flex justify-between items-center py-3 border-t border-line first:border-0 text-[13px]">
            <span>Campaign fee</span>
            <span className="font-semibold tabular-money">{formatInr(5000)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-line first:border-0 text-[13px]">
            <span>TDS 1%</span>
            <span className="font-semibold tabular-money text-bad">−{formatInr(50)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-line first:border-0 text-[15px]">
            <b className="font-bold">Lands in wallet</b>
            <b className="font-bold tabular-money">{formatInr(4950)}</b>
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-grid-gap mt-4">
        <section className="bg-surface border border-line rounded-card p-[22px]">
          <h3 className="font-sora font-bold text-[16px] tracking-tight mb-3">Ledger</h3>
          <div>
            {ledger.length === 0 ? (
              <p className="text-[12px] text-muted mt-2">No transactions yet.</p>
            ) : (
              ledger.map((l, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-t border-line first:border-0">
                  <div>
                    <span className="font-semibold">{l.t}</span><br/>
                    <small className="text-muted text-[13px]">{l.d}</small>
                  </div>
                  <span className={`font-semibold tabular-money ${l.a > 0 ? 'text-ok' : 'text-bad'}`}>
                    {l.a > 0 ? '+' : '−'}{formatInr(Math.abs(l.a))}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-card p-[22px]">
          <h3 className="font-sora font-bold text-[16px] tracking-tight mb-3">Open campaigns</h3>
          
          <div className="flex justify-between items-center py-3 border-t border-line first:border-0">
            <div>
              <b className="font-semibold">Spring Skincare Launch</b><br/>
              <small className="text-muted text-[13px]">{formatInr(5000)} · 2 slots left</small>
            </div>
            {!applied ? (
              <button 
                onClick={handleApply}
                className="border-0 rounded-button-sm px-3 py-1.5 font-semibold bg-primary text-primary-ink focus-ring text-[13px]"
              >
                Apply
              </button>
            ) : (
              <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full bg-[color-mix(in_srgb,var(--ok)_16%,transparent)] text-ok">Applied</span>
            )}
          </div>

          <div className="flex justify-between items-center py-3 border-t border-line first:border-0">
            <div>
              <b className="font-semibold">Monsoon Fitness Drop</b><br/>
              <small className="text-muted text-[13px]">{formatInr(3500)} · 5 slots left</small>
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full bg-[color-mix(in_srgb,var(--ok)_16%,transparent)] text-ok">Applied</span>
          </div>
        </section>
      </div>

      <div 
        className={`fixed left-1/2 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] -translate-x-1/2 bg-ink text-bg px-4 py-3 rounded-[14px] font-semibold opacity-0 pointer-events-none transition-opacity duration-250 ${toast ? 'opacity-100' : ''}`}
        role="status"
      >
        {toast}
      </div>
    </main>
  );
}
