import { Suspense } from "react";
import { AdDashboard } from "@/components/ad-dashboard";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense
        fallback={<div className="text-center py-8">Carregando...</div>}
      >
        <AdDashboard />
      </Suspense>
    </main>
  );
}
