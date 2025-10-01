import { redirect } from "next/navigation";
import { ConcorrentePageWrapper } from "@/components/ConcorrentePageWrapper";
import { isValidPerspective } from "@/lib/utils/url-params";

interface ConcorrenteAdPageProps {
  params: Promise<{ perspectiva: string; creativeId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConcorrenteAdPage({
  params,
  searchParams,
}: ConcorrenteAdPageProps) {
  const { perspectiva } = await params;

  // Validar perspectiva
  if (!isValidPerspective(perspectiva)) {
    redirect("/default/concorrente");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ConcorrentePageWrapper />
    </main>
  );
}
