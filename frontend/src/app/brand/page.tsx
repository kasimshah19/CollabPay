"use client";

import { useState } from "react";
import { formatInr } from "@/utils/format";

const applicants = [
  { n: "@riya.reels", f: "12.4k" },
  { n: "@aarav.creates", f: "8.1k" },
  { n: "@mehak.daily", f: "21k" }
];

export default function BrandDashboard() {
  const [approved, setApproved] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const budget = 50000;
  const fee = 5000;
  const slots = 4;
  
  const reserved = approved.length * fee;
  const left = budget - reserved;
  const filledPct = (approved.length / slots) * 100;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleApprove = (idx: number) => {
    if (approved.includes(idx) || approved.length >= slots || left < fee) return;
    setApproved([...approved, idx]);
    showToast(`Approved. ${formatInr(fee)} reserved from budget`);
  };

  return (
    <main>
      <div className="flex justify-between items-center mb-2 gap-2">
        <h2 className="font-sora font-bold text-2xl tracking-tight">Brand dashboard</h2>
        <button 
          onClick={() => showToast('Campaign form goes here')}
          className="border-0 rounded-button px-4 py-2.5 font-semibold bg-primary text-primary-ink focus-ring"
        >
          New campaign
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-grid-gap mb-4">
        <div className="bg-surface border border-line rounded-card p-[22px]">
          <small className="text-muted block text-[13px] font-semibold mb-1">Total budget</small>
          <b className="font-sora font-bold text-[26px] tabular-money">{formatInr(budget)}</b>
        </div>
        <div className="bg-surface border border-line rounded-card p-[22px]">
          <small className="text-muted block text-[13px] font-semibold mb-1">Reserved for creators</small>
          <b className="font-sora font-bold text-[26px] text-gold tabular-money">{formatInr(reserved)}</b>
        </div>
        <div className="bg-surface border border-line rounded-card p-[22px]">
          <small className="text-muted block text-[13px] font-semibold mb-1">Still available</small>
          <b className="font-sora font-bold text-[26px] tabular-money">{formatInr(left)}</b>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-grid-gap">
        <section className="bg-surface border border-line rounded-card p-[22px]">
          <div className="flex justify-between items-center mb-2 gap-2">
            <h3 className="font-sora font-bold text-xl tracking-tight">Spring Skincare Launch</h3>
            <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full bg-soft text-primary">Open</span>
          </div>
          <small className="text-muted block text-[13px]">₹5,000 per creator · 4 slots · Apply by 15 Oct · Submit by 25 Oct</small>
          
          <div className="h-2 rounded-full bg-soft overflow-hidden my-2.5 flex" aria-hidden="true">
            <div className="h-full bg-gold transition-all duration-300" style={{ width: `${filledPct}%` }}></div>
          </div>
          <small className="text-muted block text-[13px]">{approved.length} of {slots} slots filled</small>
          
          <h3 className="font-sora font-bold text-[16px] mt-5 mb-1 tracking-tight">Applicants</h3>
          <div>
            {applicants.map((a, i) => {
              const isOk = approved.includes(i);
              const isFull = approved.length >= slots || left < fee;
              return (
                <div key={i} className="flex items-center justify-between gap-3 py-3 border-t border-line first:border-0">
                  <div>
                    <b className="font-semibold">{a.n}</b><br/>
                    <small className="text-muted text-[13px]">{a.f} followers</small>
                  </div>
                  {isOk ? (
                    <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full bg-[color-mix(in_srgb,var(--ok)_16%,transparent)] text-ok">Approved</span>
                  ) : (
                    <button 
                      onClick={() => handleApprove(i)}
                      disabled={isFull}
                      className="border border-line rounded-button-sm px-3 py-1.5 font-semibold bg-transparent text-ink focus-ring disabled:opacity-45 disabled:cursor-not-allowed text-[13px]"
                    >
                      Approve · reserve {formatInr(fee)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-card p-[22px]">
          <h3 className="font-sora font-bold text-[16px] tracking-tight mb-3">Review submissions</h3>
          <div className="flex items-center justify-between gap-3 py-3 border-t border-line first:border-0">
            <div>
              <b className="font-semibold">@riya.reels</b><br/>
              <small className="text-muted text-[13px]">instagram.com/p/Cx9...</small>
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-[3px] rounded-full bg-[color-mix(in_srgb,var(--warn)_16%,transparent)] text-warn">Pending</span>
          </div>
          <div className="flex gap-2 flex-wrap mt-1.5">
            <button 
              onClick={() => showToast('Paid. Fee ₹500 + GST ₹90 billed to brand')}
              className="border-0 rounded-button-sm px-3 py-1.5 font-semibold bg-primary text-primary-ink focus-ring text-[13px]"
            >
              Approve and pay
            </button>
            <button 
              onClick={() => showToast('Revision requested')}
              className="border border-line rounded-button-sm px-3 py-1.5 font-semibold bg-transparent text-ink focus-ring text-[13px]"
            >
              Request revision (0/2)
            </button>
            <button 
              onClick={() => showToast('Submission rejected')}
              className="border border-line rounded-button-sm px-3 py-1.5 font-semibold bg-transparent text-bad focus-ring text-[13px]"
            >
              Reject
            </button>
          </div>
          <p className="text-[12px] text-muted mt-2">Approving pays the creator and splits fee and GST for you.</p>
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
