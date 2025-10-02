import { DrilldownContent } from "@/features/performance/components/DrilldownContent";
import type { Perspective, Product } from "@/features/performance/types";

interface PageProps {
  params: Promise<{ perspectiva: string; produto: string }>;
}

export default async function ProductDrilldownPage({ params }: PageProps) {
  const { perspectiva, produto } = await params;
  const perspective = perspectiva as Perspective;
  const product = produto.toUpperCase() as Product;

  return <DrilldownContent perspective={perspective} product={product} />;
}
