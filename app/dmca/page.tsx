import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'DMCA - StreamVerse',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#050510] text-[#D1D5DB] font-sans selection:bg-[#8F44FF]/30">
      <Suspense fallback={<div className="h-[80px] bg-[#050510]" />}>
        <Navbar />
      </Suspense>
      
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            DMCA & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44FF] to-[#FF3366]">Direitos Autorais</span>
          </h1>
          <p className="text-[#8A93A6] text-lg">Informações Legais de Conformidade</p>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">Aviso Importante</h2>
            <p className="text-[#8A93A6] mb-4">
              O StreamVerse atua <strong className="text-white">exclusivamente como um motor de busca de mídia</strong> (semelhante ao Google ou Bing) e não armazena e nem hospeda quaisquer arquivos de mídia protegidos por direitos autorais em seus próprios servidores.
            </p>
            <p className="text-[#8A93A6]">
              Todo o conteúdo visualizado em nossa plataforma é processado em tempo real, oriundo diretamente de plataformas, servidores e sites de terceiros independentes sobre os quais não exercemos controle algum.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">Remoção de Conteúdo</h2>
            <p className="text-[#8A93A6] mb-4">
              Tendo em vista que não hospedamos os vídeos ou arquivos e não os enviamos, somos incapazes de removê-los da fonte original da Internet. No entanto, em total conformidade com a <strong className="text-white">Digital Millennium Copyright Act (DMCA)</strong> e diretrizes legais internacionais de proteção a direitos autorais, estamos sempre dispostos a remover os <strong className="text-white">links indexados</strong> em nosso site se o detentor dos direitos solicitar apropriadamente.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-amber-500/20 p-8 rounded-3xl shadow-xl bg-amber-500/5">
            <h2 className="text-2xl font-display font-bold text-amber-500 mb-4">Ação Efetiva</h2>
            <p className="text-[#8A93A6] mb-4">
              A maneira mais rápida e eficaz de retirar um conteúdo não-autorizado do ar é enviando um aviso de infração (DMCA Takedown Notice) diretamente para a <strong className="text-amber-500">plataforma que hospeda fisicamente o arquivo</strong> (como Google Drive, Mega, fembed, supervideo, etc.). Somente removendo o arquivo na origem você garante que ele desapareça definitivamente de toda a web, e não apenas do nosso indexador.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">Enviar Notificação para Nós</h2>
            <p className="text-[#8A93A6] mb-4">
              Se você é o proprietário dos direitos autorais e deseja que a página de índice referente ao seu conteúdo seja removida do StreamVerse, por favor preencha o formulário na página de Contato com as seguintes informações formais:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#8A93A6]">
              <li>Identificação da obra cujos direitos autorais supostamente foram violados.</li>
              <li>A URL exata ou localização da referência na nossa plataforma.</li>
              <li>Declaração de boa fé e comprovação de titularidade dos direitos autorais.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
