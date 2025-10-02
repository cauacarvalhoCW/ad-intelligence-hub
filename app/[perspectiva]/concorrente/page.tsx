import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdDashboard } from "@/components/ad-dashboard";
import { LogoLoading } from "@/shared/ui/logo-loading";

// Valid perspectives
const VALID_PERSPECTIVES = ["default", "cloudwalk", "infinitepay", "jim"] as const;
type ValidPerspective = typeof VALID_PERSPECTIVES[number];

interface PageProps {
  params: Promise<{ perspectiva: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConcorrentePage({ params, searchParams }: PageProps) {
  const { perspectiva } = await params;
  const search = await searchParams;
  
  // Validate perspective
  if (!VALID_PERSPECTIVES.includes(perspectiva as ValidPerspective)) {
    redirect("/default/concorrente");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense
        fallback={<LogoLoading size="lg" text="Carregando dashboard..." />}
      >
        <AdDashboard 
          perspectiva={perspectiva as ValidPerspective}
          searchParams={search}
        />
      </Suspense>
    </main>
  );
}

