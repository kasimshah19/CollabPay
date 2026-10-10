import { EmptyState } from "@/components/ui/EmptyState";
import { FileText } from "lucide-react";

export default function SubmissionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-sora text-2xl font-bold text-ink">Submissions</h2>
      <EmptyState
        icon={FileText}
        title="Coming in the next step"
        description="Submission review will be built in Phase 7B."
      />
    </div>
  );
}
