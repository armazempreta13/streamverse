'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Instagram, Film, AlertTriangle } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  
  // Esconder o footer em páginas de player para não atrapalhar a imersão
  if (pathname?.startsWith('/watch')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#03030A] border-t border-white/5 pt-12 pb-8 mt-auto relative z-[60]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-4 mb-12">
          
          <div className="flex flex-col max-w-sm">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8F44FF] to-[#FF3366] flex items-center justify-center group-hover:scale-105 transition-transform">
                 <Film className="size-4 text-white" />
              </div>
              <span className="text-[20px] font-display font-bold tracking-tight text-white">StreamVerse</span>
            </Link>
            <p className="text-sm text-[#8A93A6] leading-relaxed mb-6">
              A sua plataforma definitiva para explorar filmes, séries e animes. 
              Entretenimento premium com a melhor qualidade e usabilidade.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#8A93A6] hover:bg-[#1DA1F2] hover:text-white hover:shadow-[0_0_15px_rgba(29,161,242,0.4)] transition-all">
                 <Twitter className="size-4" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#8A93A6] hover:bg-[#E1306C] hover:text-white hover:shadow-[0_0_15px_rgba(225,48,108,0.4)] transition-all">
                 <Instagram className="size-4" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#8A93A6] hover:bg-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
                 <Github className="size-4" />
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-12 sm:gap-20">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-wide uppercase text-sm mb-2">Navegação</h4>
              <Link href="/movies" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Filmes</Link>
              <Link href="/series" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Séries</Link>
              <Link href="/animes" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Animes</Link>
              <Link href="/search" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Buscar</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-wide uppercase text-sm mb-2">Legal</h4>
              <Link href="/termos" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Privacidade</Link>
              <Link href="/dmca" className="text-sm text-[#8A93A6] hover:text-white transition-colors">DMCA</Link>
              <Link href="/contato" className="text-sm text-[#8A93A6] hover:text-white transition-colors">Contato</Link>
            </div>
          </div>
        </div>
        
        {/* Aviso Legal sobre Hospedagem */}
        <div className="bg-[#131520] border border-amber-500/10 rounded-xl p-5 flex items-start sm:items-center gap-4 mb-8 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
           <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
           <p className="text-xs sm:text-sm text-[#8A93A6] leading-relaxed relative z-10">
             <strong className="text-white">Aviso Legal:</strong> O StreamVerse funciona apenas como um indexador automático. 
             <strong className="text-amber-500"> Nós não armazenamos, não hospedamos e não enviamos nenhum vídeo ou arquivo em nossos servidores.</strong> Todo o conteúdo exibido é provido por plataformas e servidores de terceiros não afiliados a nós. Em caso de infração de direitos autorais, a notificação deve ser enviada aos servidores de hospedagem responsáveis.
           </p>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8A93A6] font-medium tracking-wide">
            © {new Date().getFullYear()} StreamVerse. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#8A93A6] font-medium tracking-wide">
            Desenvolvido com <span className="text-[#FF3366]">❤️</span> para a comunidade
          </p>
        </div>
      </div>
    </footer>
  );
}
