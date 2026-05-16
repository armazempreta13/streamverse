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

export const metadata: Metadata = {
  title: 'StreamVerse - Filmes e Séries',
  description: 'A melhor experiência de streaming.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable} ${montserrat.variable} ${bebas.variable} ${cinzel.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-[#050510]" suppressHydrationWarning>

        <ClientProviders>
          {children}
          <GlobalAmbilight />
        </ClientProviders>
      </body>
    </html>
  );
}
