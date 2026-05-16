export const siteConfig = {
  features: {
    globalAmbilight: true, // Liga/Desliga a iluminação ambiente global e partículas
    heroGlow: false, // Liga/Desliga o feixe de luz roxa sob a caixa do IMDb
    dynamicHeroTypography: true, // Liga/Desliga o sistema dinâmico de fontes para a Hero
    otakuPremium: true, // Liga/Desliga a atmosfera premium japonesa na aba Animes
    crunchyrollStyleLayout: false, // Ativa o design de grid e botões idêntico à referência Crunchyroll/Anime
    showAnimesOnHome: true, // Se deve incluir carrosséis de anime na página inicial
    premiumHomeLayout: true, // Ativa a estrutura ideal de catálogo (mistura Netflix/Prime/Crunchyroll)
    catalogSync: true, // Ativa o sistema de sincronização automática com TMDB (CatalogSyncService)
    securityGuard: true, // Ativa o sistema de segurança multicamadas (fingerprint, detecção de bots)
  },
  security: {
    rateLimitApiPerMinute: 60,   // Máx requests por minuto em rotas /api/*
    rateLimitPagePerMinute: 120, // Máx requests por minuto em páginas
    shadowThrottleMs: 2000,      // Delay artificial para clientes suspeitos (ms)
    blockBadBots: true,          // Bloquear bots maliciosos conhecidos
    wafEnabled: true,            // Ativar WAF (SQL injection, XSS, path traversal)
    cspEnabled: true,            // Ativar Content Security Policy
  },
  hero: {
    // Defina os nomes dos filmes/séries que você quer exibir na Hero.
    // O sistema fará a busca automática de cada um.
    // Se deixar a lista vazia [], ele usará os títulos "Em Alta" do TMDB por padrão.
    customTitles: [
      'Como Mágica',
      'O Justiceiro',
      'The Boys',
      'Devoradores de Estrelas',
      'Mortal Kombat 2',
      'Michael'

    ]
  }
};
