import { redirect } from "next/navigation";
import { ConcorrentePageWrapper } from "@/components/ConcorrentePageWrapper";
import { isValidPerspective } from "@/lib/utils/url-params";

interface ConcorrentePageProps {
  params: Promise<{ perspectiva: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConcorrentePage({
  params,
  searchParams,
}: ConcorrentePageProps) {
  const { perspectiva } = await params;

  // Validar perspectiva
  if (!isValidPerspective(perspectiva)) {
    redirect("/default/concorrente");
  }

  // Anúncio agora é via query param ?ad=<id> - não precisa redirect
  
  return (
    <main className="container mx-auto px-4 py-8">
      <ConcorrentePageWrapper />
    </main>
  );
}
