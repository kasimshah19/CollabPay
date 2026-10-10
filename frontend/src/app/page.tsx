import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <Logo />
      <p className="text-muted max-w-md">
        Run campaigns. Pay creators. Every rupee tracked.
      </p>
      <Link href="/design-system" className="mt-4">
        <Button variant="secondary">View Design System</Button>
      </Link>
    </div>
  );
}
