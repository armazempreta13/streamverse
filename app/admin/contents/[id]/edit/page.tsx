'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { ContentForm } from '../../ContentForm';
import { doc, getDoc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/');
  }, [isAdmin, loading, router]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!isAdmin) return;
      try {
        const docRef = doc(db, 'contents', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInitialData({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push('/admin');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchContent();
  }, [id, isAdmin, router]);

  if (loading || !isAdmin || loadingData) return <div className="min-h-screen bg-[#0A0C10] text-white pt-24"><p className="text-center">Carregando...</p></div>;

  return (
    <main className="min-h-screen bg-[#0A0C10] text-white pt-24 pb-20 px-8">
      <div className="max-w-6xl mx-auto pl-20">
        {initialData && <ContentForm initialData={initialData} id={id} />}
      </div>
    </main>
  );
}
