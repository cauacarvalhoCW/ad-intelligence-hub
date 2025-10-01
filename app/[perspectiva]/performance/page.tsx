import { redirect } from "next/navigation";
import { isValidPerspective } from "@/lib/utils/url-params";
import { PerformanceDashboard } from "@/features/performance/components/PerformanceDashboard";

interface PerformancePageProps {
  params: Promise<{ perspectiva: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PerformancePage({
  params,
  searchParams,
}: PerformancePageProps) {
  const { perspectiva } = await params;

  // Validar perspectiva
  if (!isValidPerspective(perspectiva)) {
    redirect("/default/performance");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <PerformanceDashboard />
    </main>
  );
}
