import type {Metadata} from 'next';
import { Inter, Space_Grotesk, Montserrat, Bebas_Neue, Cinzel, Outfit } from 'next/font/google';
import './globals.css';
import { GlobalAmbilight } from '@/components/GlobalAmbilight';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

import { ClientProviders } from '@/components/ClientProviders';
import { SecurityGuard } from '@/components/SecurityGuard';
import { Footer } from '@/components/Footer';
import { CursorEngine } from '@/components/cursor-engine/CursorEngine';
import { SupportSystem } from '@/components/SupportSystem';

export const metadata: Metadata = {
  title: 'StreamVerse - Filmes, Séries e Animes Online em HD',
  description: 'Assista aos melhores filmes, séries e animes online em alta definição no StreamVerse. O melhor catálogo de streaming com lançamentos atualizados diariamente.',
  keywords: 'streaming, filmes online, séries online, assistir animes, streamverse, cinema em casa, filmes hd',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'StreamVerse - O Universo do Streaming',
    description: 'A melhor experiência de streaming com catálogo completo de filmes, séries e animes.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'StreamVerse',
  },
  robots: 'index, follow',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable} ${montserrat.variable} ${bebas.variable} ${cinzel.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-[#050510]" suppressHydrationWarning>

        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <GlobalAmbilight />
          <SecurityGuard />
          <CursorEngine />
          <SupportSystem />
        </ClientProviders>
      </body>
    </html>
  );
}
