import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed shadow-sm bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter font-headline">
          Welcome to your dashboard, BOSS
        </h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Select an item from the sidebar to begin editing or view your new analytics.
        </p>
        <Button asChild>
          <Link href="/admin/dashboard/analytics">
            View Analytics <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
