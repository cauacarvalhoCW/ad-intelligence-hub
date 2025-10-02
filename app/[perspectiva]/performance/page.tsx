import { OverviewContent } from "@/features/performance/components/OverviewContent";
import type { Perspective } from "@/features/performance/types";

interface PageProps {
  params: Promise<{ perspectiva: string }>;
}

export default async function PerformanceOverviewPage({ params }: PageProps) {
  const { perspectiva } = await params;
  const perspective = perspectiva as Perspective;

  return <OverviewContent perspective={perspective} />;
}

