import { EmptyState } from "@/components/ui/EmptyState";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-sora text-2xl font-bold text-ink">Notifications</h2>
      <EmptyState
        icon={Bell}
        title="Coming in the next step"
        description="Notification feeds will be built in future phases."
      />
    </div>
  );
}
