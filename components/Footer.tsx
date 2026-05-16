'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  
  // Esconder o footer em páginas de player para não atrapalhar a imersão
  if (pathname?.startsWith('/watch')) {
    return null;
  }

  return (
    <footer className="w-full relative mt-auto z-[60]">
      {/* Gradient superior super suave para fundir o footer com o fundo da página */}
      <div 
        className="absolute top-[-250px] left-0 w-full h-[250px] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,5,16,0) 0%, rgba(5,5,16,0.3) 45%, rgba(5,5,16,0.7) 75%, rgba(5,5,16,1) 100%)'
        }}
      />
      
      <div className="w-full bg-[#050510] pt-4 pb-8 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col items-center gap-8">
          
          {/* Aviso Legal Elegante */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-[#0A0A16] border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
               <AlertCircle className="size-5 text-amber-500" />
            </div>
            <p className="text-[12px] text-[#8A93A6] leading-relaxed text-center sm:text-left max-w-3xl">
              <strong className="text-white font-medium tracking-wide">Indexador Automático:</strong> Nós não armazenamos, hospedamos ou fazemos upload de nenhum vídeo ou mídia. Todo o conteúdo reproduzido é buscado automaticamente na internet e provido por servidores de terceiros não afiliados a nós. Em caso de infrações de direitos autorais, notifique os provedores de hospedagem responsáveis.
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent max-w-2xl" />

          {/* Links e Créditos */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl gap-6">
            
            <div className="flex items-center gap-6 text-[13px] font-medium text-[#8A93A6]">
              <Link href="/termos" className="hover:text-white transition-colors relative group">
                Termos
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
              </Link>
              <Link href="/privacidade" className="hover:text-white transition-colors relative group">
                Privacidade
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
              </Link>
              <Link href="/dmca" className="hover:text-white transition-colors relative group">
                DMCA
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
              </Link>
              <Link href="/contato" className="hover:text-white transition-colors relative group">
                Contato
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
              </Link>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#8A93A6]">
              <span>© {new Date().getFullYear()} StreamVerse.</span>
              <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
              <span>Criado por</span>
              <a 
                href="https://phstatic.com.br" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-black tracking-wide bg-gradient-to-r from-[#8F44FF] to-[#FF3366] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                phstatic.com.br
              </a>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
