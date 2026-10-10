import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-sora text-2xl font-bold text-ink">Wallet</h2>
      <EmptyState
        icon={Wallet}
        title="Coming in the next step"
        description="Wallet tracking, ledger, and withdrawals will be built in Phase 7C."
      />
    </div>
  );
}
