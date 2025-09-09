import { requireAuthWithDomainCheck } from '@/lib/auth-helpers';
import { Header } from '@/components/header';
import { Suspense } from 'react';

export default async function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Verify authentication and domain in server-side
  // This will automatically redirect if auth fails or domain is invalid
  const { userId, user } = await requireAuthWithDomainCheck();
  
  console.log('✅ Protected Layout: Domain check passed for user:', userId);
  console.log('📧 User email:', user?.primaryEmailAddress?.emailAddress);

  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </>
  );
}
