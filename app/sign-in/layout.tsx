import { Suspense } from "react";

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
