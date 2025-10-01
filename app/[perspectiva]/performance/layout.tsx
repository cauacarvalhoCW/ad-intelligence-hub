import { redirect } from "next/navigation";
import { isValidPerspective } from "@/lib/utils/url-params";

interface PerformanceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ perspectiva: string }>;
}

export default async function PerformanceLayout({
  children,
  params,
}: PerformanceLayoutProps) {
  const { perspectiva } = await params;

  // Validar perspectiva
  if (!isValidPerspective(perspectiva)) {
    redirect("/default/performance");
  }

  // Header já está no layout pai [perspectiva]/layout.tsx
  return <>{children}</>;
}

