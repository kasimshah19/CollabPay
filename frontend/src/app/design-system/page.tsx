"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { Money } from "@/components/ui/Money";

const ColorSwatch = ({ name, hex }: { name: string; hex: string }) => (
  <div className="flex flex-col gap-2">
    <div
      className="w-full h-16 rounded-md shadow-sm border border-line"
      style={{ backgroundColor: `var(${name})` }}
    />
    <div className="text-xs">
      <div className="font-medium text-ink">{name}</div>
      <div className="text-muted">{hex}</div>
    </div>
  </div>
);

export default function DesignSystemPage() {
  const [segment, setSegment] = useState("brand");
  const { showToast } = useToast();

  return (
    <div className="space-y-16 pb-20">
      <header className="border-b border-line pb-8">
        <h1 className="text-3xl font-heading font-bold text-ink">Design System</h1>
        <p className="text-muted mt-2">Visual verification of CollabPay components and tokens.</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-heading font-semibold border-b border-line pb-2">Color Tokens</h2>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted">Primary & Brand</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="--bg" hex="#FFFFFF / #0D0A14" />
            <ColorSwatch name="--surface" hex="#F8F7FA / #14112E" />
            <ColorSwatch name="--primary" hex="#6C4CFF / #8B73FF" />
            <ColorSwatch name="--gold" hex="#FFD700" />
          </div>
          
          <h3 className="text-sm font-medium text-muted mt-6">Text & Lines</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="--ink" hex="#110D20 / #F8F7FA" />
            <ColorSwatch name="--muted" hex="#6E6A80 / #9A95AA" />
            <ColorSwatch name="--line" hex="#E5E3EB / #2D274A" />
            <ColorSwatch name="--soft" hex="#F0EEF5 / #1E1A3D" />
          </div>

          <h3 className="text-sm font-medium text-muted mt-6">Semantic Tones</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorSwatch name="--ok" hex="#00C48C" />
            <ColorSwatch name="--warn" hex="#FF9900" />
            <ColorSwatch name="--bad" hex="#FF4C4C" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-heading font-semibold border-b border-line pb-2">Typography Scale</h2>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted mb-1">Heading 1 (Sora, 32px, bold)</div>
            <h1 className="text-4xl font-heading font-bold text-ink tracking-[-0.02em]">The quick brown fox</h1>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Heading 2 (Sora, 24px, semibold)</div>
            <h2 className="text-2xl font-heading font-semibold text-ink tracking-[-0.02em]">The quick brown fox</h2>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Heading 3 (Sora, 20px, semibold)</div>
            <h3 className="text-xl font-heading font-semibold text-ink tracking-[-0.02em]">The quick brown fox</h3>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Body (Inter, 15px, regular)</div>
            <p className="text-[15px] font-body text-ink">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Small/Muted (Inter, 13px, medium)</div>
            <p className="text-sm font-body font-medium text-muted">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-heading font-semibold border-b border-line pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="gold">Gold Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-heading font-semibold border-b border-line pb-2">Inputs & Controls</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-input">Default Input</Label>
              <Input id="default-input" placeholder="Enter text..." helperText="This is a helper text." />
            </div>
            <div>
              <Label htmlFor="error-input">Error Input</Label>
              <Input id="error-input" placeholder="Enter text..." error="This field is required." />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Segmented Control</Label>
              <SegmentedControl
                options={[
                  { label: "Brand", value: "brand" },
                  { label: "Creator", value: "creator" },
                ]}
                value={segment}
                onChange={setSegment}
                ariaLabel="User type"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-heading font-semibold border-b border-line pb-2">Feedback & Status</h2>
        
        <div className="space-y-8">
          <div className="flex gap-4">
            <StatusPill tone="neutral">Neutral</StatusPill>
            <StatusPill tone="ok">Completed</StatusPill>
            <StatusPill tone="warn">Pending</StatusPill>
            <StatusPill tone="bad">Failed</StatusPill>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <Label className="mb-2 block">Progress (70% full, 15% reserved)</Label>
              <ProgressBar value={70} reserved={15} ariaLabel="Campaign progress" />
            </div>
            <div>
              <Label className="mb-2 block">Progress (30% full)</Label>
              <ProgressBar value={30} ariaLabel="Campaign progress" />
            </div>
          </div>

          <div>
            <Button variant="secondary" onClick={() => showToast("Action successful!")}>
              Trigger Toast
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-heading font-semibold border-b border-line pb-2">Money Displays</h2>
        <Card className="max-w-md space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Default</span>
            <Money paise={1500000} tone="default" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Credit</span>
            <Money paise={25000} tone="credit" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Debit</span>
            <Money paise={12500} tone="debit" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Gold Moment</span>
            <Money paise={10000000} tone="gold" />
          </div>
        </Card>
      </section>
    </div>
  );
}
