"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { parseRupeesToPaise, calculatePayout, PLATFORM_FEE_BPS, GST_BPS, TDS_BPS } from "@/lib/money";
import { istInputToUtcIso } from "@/lib/datetime";
import { createCampaign } from "@/lib/api/campaigns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function NewCampaignPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    feePerCreatorRupees: "",
    slots: "",
    applicationDeadline: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations for summary card
  const parsedFee = parseRupeesToPaise(form.feePerCreatorRupees);
  const feePaise = parsedFee.ok ? parsedFee.paise : 0;
  const payoutPreview = calculatePayout(feePaise);
  
  const slotsNum = parseInt(form.slots, 10);
  const isValidSlots = !isNaN(slotsNum) && slotsNum > 0;
  
  const totalCost = isValidSlots ? payoutPreview.brandCostPaise * slotsNum : payoutPreview.brandCostPaise;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.requirements.trim()) newErrors.requirements = "Requirements are required";
    
    const feeRes = parseRupeesToPaise(form.feePerCreatorRupees);
    if (!feeRes.ok) {
      newErrors.feePerCreatorRupees = feeRes.error;
    }
    
    if (!form.slots || isNaN(parseInt(form.slots, 10)) || parseInt(form.slots, 10) <= 0) {
      newErrors.slots = "Must be a valid number of slots";
    }
    
    if (!form.applicationDeadline) {
      newErrors.applicationDeadline = "Deadline is required";
    } else {
      const utc = istInputToUtcIso(form.applicationDeadline);
      if (new Date(utc) <= new Date()) {
        newErrors.applicationDeadline = "Deadline must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedFee = parseRupeesToPaise(form.feePerCreatorRupees);
    if (!parsedFee.ok) return;

    setLoading(true);
    try {
      await createCampaign({
        title: form.title,
        description: form.description,
        requirements: form.requirements.split("\n").filter(r => r.trim()),
        feePerCreatorPaise: parsedFee.paise,
        slots: parseInt(form.slots, 10),
        applicationDeadline: istInputToUtcIso(form.applicationDeadline)
      });
      showToast("Campaign created successfully!");
      router.push("/brand/campaigns");
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/brand/campaigns" className="inline-flex items-center text-sm text-muted hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to campaigns
        </Link>
        <h1 className="font-sora text-2xl font-bold text-ink">New Campaign</h1>
        <p className="text-muted mt-1">Create a new campaign to collaborate with creators.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 bg-surface p-6 rounded-2xl border border-line">
          <Input
            id="title"
            label="Campaign Title"
            placeholder="e.g., Summer Fashion Haul"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />

          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="description" className="text-sm font-medium text-ink">Description</label>
            <textarea
              id="description"
              className={`min-h-[120px] p-3 bg-surface border rounded-md text-ink placeholder:text-muted focus-ring resize-y ${
                errors.description ? "border-bad" : "border-line"
              }`}
              placeholder="Describe the campaign objectives..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && <p className="text-sm text-bad">{errors.description}</p>}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="requirements" className="text-sm font-medium text-ink">Requirements (one per line)</label>
            <textarea
              id="requirements"
              className={`min-h-[120px] p-3 bg-surface border rounded-md text-ink placeholder:text-muted focus-ring resize-y ${
                errors.requirements ? "border-bad" : "border-line"
              }`}
              placeholder="e.g., Must have 10k+ followers&#10;Post 1 Reel & 2 Stories"
              value={form.requirements}
              onChange={e => setForm({ ...form, requirements: e.target.value })}
            />
            {errors.requirements && <p className="text-sm text-bad">{errors.requirements}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="fee"
              label="Fee per Creator (₹)"
              placeholder="5000"
              type="number"
              min="0"
              step="any"
              value={form.feePerCreatorRupees}
              onChange={e => setForm({ ...form, feePerCreatorRupees: e.target.value })}
              error={errors.feePerCreatorRupees}
            />

            <Input
              id="slots"
              label="Number of Slots"
              placeholder="5"
              type="number"
              min="1"
              step="1"
              value={form.slots}
              onChange={e => setForm({ ...form, slots: e.target.value })}
              error={errors.slots}
            />
          </div>

          <Input
            id="deadline"
            label="Application Deadline (IST)"
            type="datetime-local"
            value={form.applicationDeadline}
            onChange={e => setForm({ ...form, applicationDeadline: e.target.value })}
            error={errors.applicationDeadline}
            helperText="Creators won't be able to apply after this date."
          />

          <div className="pt-4 border-t border-line flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>

        <div className="w-full lg:w-96 sticky top-8">
          <Card className="p-6">
            <h3 className="font-sora font-semibold text-lg text-ink mb-4">Budget Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted">
                <span>Fee per creator</span>
                <span><Money paise={feePaise} /></span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Platform fee ({PLATFORM_FEE_BPS / 100}%)</span>
                <span><Money paise={payoutPreview.platformFeePaise} /></span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>GST ({GST_BPS / 100}%)</span>
                <span><Money paise={payoutPreview.gstPaise} /></span>
              </div>
              
              <div className="pt-3 border-t border-line">
                <div className="flex justify-between items-center font-medium text-ink">
                  <span>Total cost per slot</span>
                  <span><Money paise={payoutPreview.brandCostPaise} /></span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-line">
                <div className="flex justify-between items-center font-medium text-ink">
                  <span>Total slots</span>
                  <span>× {isValidSlots ? slotsNum : 0}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-line">
                <div className="flex justify-between items-center font-semibold text-lg text-ink">
                  <span>Total Budget</span>
                  <span><Money paise={totalCost} className="text-gold" /></span>
                </div>
                <p className="text-xs text-muted mt-1 text-right">
                  This amount will be reserved upon creation.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-soft rounded-lg text-xs text-muted space-y-2">
              <p><strong>Note for Creators:</strong></p>
              <p>
                Creators will receive <Money paise={payoutPreview.creatorPayoutPaise} className="font-medium text-ink inline" />. 
                This is calculated as the base fee minus TDS ({TDS_BPS / 100}%).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
