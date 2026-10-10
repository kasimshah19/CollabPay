import { EmptyState } from "@/components/ui/EmptyState";
import { Compass } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-sora text-2xl font-bold text-ink">Discover</h2>
      <EmptyState
        icon={Compass}
        title="Coming in the next step"
        description="Campaign discovery and applications will be built in Phase 7C."
      />
    </div>
  );
}
