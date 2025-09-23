'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
