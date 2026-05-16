'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ContentForm } from '../ContentForm';

export default function NewContentPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/');
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#0A0C10] text-white pt-24 pb-20 px-8">
      <div className="max-w-6xl mx-auto pl-20">
        <ContentForm />
      </div>
    </main>
  );
}
