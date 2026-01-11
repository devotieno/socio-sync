'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScheduledPostsProvider from '@/components/ScheduledPostsProvider';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session && !loading && !user) {
      router.push('/auth/signin');
    }
  }, [session, status, user, loading, router]);

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!session && !user) {
    return null;
  }

  return (
    <ScheduledPostsProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ScheduledPostsProvider>
  );
}
