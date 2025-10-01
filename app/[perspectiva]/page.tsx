import { redirect } from "next/navigation";
import { isValidPerspective } from "@/lib/utils/url-params";

interface PerspectivePageProps {
  params: Promise<{ perspectiva: string }>;
}

export default async function PerspectivePage({
  params,
}: PerspectivePageProps) {
  const { perspectiva } = await params;

  // Validar perspectiva
  if (!isValidPerspective(perspectiva)) {
    redirect("/default/performance");
  }

  // Redirecionar para página de performance
  redirect(`/${perspectiva}/performance`);
}

