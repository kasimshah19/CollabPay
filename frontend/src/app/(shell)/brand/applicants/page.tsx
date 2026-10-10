import { EmptyState } from "@/components/ui/EmptyState";
import { FileText } from "lucide-react";

export default function ApplicantsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-sora text-2xl font-bold text-ink">Applicants</h2>
      <EmptyState
        icon={FileText}
        title="Coming in the next step"
        description="Applicant review and approval will be built in Phase 7B."
      />
    </div>
  );
}
