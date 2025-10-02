import { requireAuthWithDomainCheck } from "@/lib/auth-helpers";
import { Header } from "@/components/header";
import { LogoLoading } from "@/shared/ui/logo-loading";
import { Suspense } from "react";

export default async function PerspectiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify authentication and domain in server-side
  // This will automatically redirect if auth fails or domain is invalid
  const { userId, user } = await requireAuthWithDomainCheck();

  console.log("✅ Perspective Layout: Domain check passed for user:", userId);
  console.log("📧 User email:", user?.primaryEmailAddress?.emailAddress);

  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <LogoLoading size="lg" text="Carregando página..." />
        </div>
      }>
        {children}
      </Suspense>
    </>
  );
}

