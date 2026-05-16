import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Termos de Uso - StreamVerse',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#050510] text-[#D1D5DB] font-sans selection:bg-[#8F44FF]/30">
      <Suspense fallback={<div className="h-[80px] bg-[#050510]" />}>
        <Navbar />
      </Suspense>
      
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            Termos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44FF] to-[#FF3366]">Uso</span>
          </h1>
          <p className="text-[#8A93A6] text-lg">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Aceitação dos Termos</h2>
            <p className="text-[#8A93A6] mb-4">
              Ao acessar e utilizar o StreamVerse, você concorda em cumprir e ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossa plataforma. O uso contínuo da plataforma após alterações nestes termos constitui aceitação das novas diretrizes.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. Natureza do Serviço</h2>
            <p className="text-[#8A93A6] mb-4">
              O StreamVerse é estritamente um serviço de <strong className="text-white">indexação e busca automatizada</strong>. O site funciona de forma semelhante a buscadores genéricos, organizando e estruturando metadados e links encontrados de forma pública na internet.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#8A93A6]">
              <li>Nós <strong className="text-white">NÃO</strong> armazenamos nenhum arquivo de vídeo ou áudio em nossos servidores.</li>
              <li>Nós <strong className="text-white">NÃO</strong> fazemos upload de conteúdo para plataformas de terceiros.</li>
              <li>Nós <strong className="text-white">NÃO</strong> possuímos direitos autorais ou controle sobre o conteúdo hospedado por terceiros.</li>
            </ul>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. Responsabilidade do Usuário</h2>
            <p className="text-[#8A93A6] mb-4">
              O uso do StreamVerse é de sua inteira responsabilidade. Você concorda que não usará a plataforma para propósitos ilegais, comerciais ou não autorizados. Os vídeos reproduzidos nos players integrados são servidos diretamente pelas plataformas de hospedagem independentes.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Anúncios de Terceiros</h2>
            <p className="text-[#8A93A6]">
              Os players de vídeo de terceiros podem conter anúncios sobre os quais o StreamVerse não possui controle (pop-ups, redirecionamentos). Recomendamos enfaticamente a adoção das melhores práticas de navegação segura e bloqueadores de anúncios ao reproduzir conteúdos de terceiros.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
