import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { siteConfig } from '@/config/site';
import { PremiumAnimePage } from './PremiumAnimePage';
import { StandardAnimePage } from './StandardAnimePage';

export default function AnimesPage() {
  const isPremium = siteConfig.features.otakuPremium;

  return (
    <main className="min-h-screen text-white flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative bg-[#050510] z-10">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>

        {isPremium ? <PremiumAnimePage /> : <StandardAnimePage />}
      </div>
    </main>
  );
}
