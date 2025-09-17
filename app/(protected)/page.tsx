import { Suspense } from "react";
import { AdDashboard } from "@/components/ad-dashboard";
import { LogoLoading } from "@/shared/ui/logo-loading";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense
        fallback={<LogoLoading size="lg" text="Carregando dashboard..." />}
      >
        <AdDashboard />
      </Suspense>
    </main>
  );
}
