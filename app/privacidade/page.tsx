import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Política de Privacidade - StreamVerse',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#050510] text-[#D1D5DB] font-sans selection:bg-[#8F44FF]/30">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44FF] to-[#FF3366]">Privacidade</span>
          </h1>
          <p className="text-[#8A93A6] text-lg">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Informações que Coletamos</h2>
            <p className="text-[#8A93A6] mb-4">
              A privacidade dos nossos usuários é de extrema importância. O StreamVerse coleta apenas as informações mínimas necessárias para o funcionamento adequado da plataforma. Isso pode incluir informações fornecidas por provedores de autenticação social (Google, etc.) no momento do login, caso aplicável.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. Como Usamos as Informações</h2>
            <p className="text-[#8A93A6] mb-4">
              Não vendemos, não alugamos e não compartilhamos seus dados pessoais com terceiros para fins publicitários. Os dados podem ser utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#8A93A6]">
              <li>Manter seu histórico de "Continuar Assistindo".</li>
              <li>Salvar suas preferências de usuário e listas.</li>
              <li>Garantir a segurança contra ataques de negação de serviço (DDoS) ou scrapers abusivos.</li>
            </ul>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. Cookies e Tecnologias Semelhantes</h2>
            <p className="text-[#8A93A6] mb-4">
              Usamos tecnologias de armazenamento local e cookies para melhorar a experiência do usuário (por exemplo, lembrar onde um vídeo parou e autenticar a sua sessão). Você pode desativar o uso de cookies no seu navegador, porém algumas funcionalidades da plataforma poderão ser afetadas.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Terceiros</h2>
            <p className="text-[#8A93A6]">
              Nossa plataforma exibe conteúdos incorporados de terceiros (via iframes). Estes fornecedores externos de players e publicidade podem coletar dados adicionais (como seu endereço IP) independentemente da nossa política. Não somos responsáveis pelas práticas de privacidade de sites vinculados.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
