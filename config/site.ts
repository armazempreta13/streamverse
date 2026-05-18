/**
 * 🌟 STREAMVERSE - SISTEMA GLOBAL DE CONFIGURAÇÃO DO SITE
 * 
 * Este arquivo centraliza todas as configurações de comportamento, recursos visuais,
 * segurança, metadados, navegação e integração do ecossistema StreamVerse.
 * Sinta-se à vontade para ativar, desativar ou ajustar os parâmetros abaixo.
 */

// -----------------------------------------------------------------------------
// 1. CONFIGURAÇÃO GERAL E DE RECURSOS (siteConfig)
// -----------------------------------------------------------------------------
export const siteConfig = {
  // Informações fundamentais de Identidade e Metadados SEO
  meta: {
    name: "StreamVerse",
    shortName: "StreamVerse",
    description: "A melhor e mais premium plataforma de streaming de filmes, séries e animes online em alta definição.",
    url: "https://streamverse.app",
    ogImage: "/images/og-image.jpg",
    favicon: "/favicon.ico",
    author: "StreamVerse Team",
    supportEmail: "suporte@streamverse.app",
  },

  // Menu de Navegação Principal do Site (Navbar & Sidebar)
  navigation: {
    mainNav: [
      { title: "Início", href: "/" },
      { title: "Filmes", href: "/catalog/movies" },
      { title: "Séries", href: "/catalog/series" },
      { title: "Animes", href: "/catalog/animes" },
      { title: "Minha Lista", href: "/profile/mylist" },
    ],
    socials: {
      github: "https://github.com/armazempreta13/streamverse",
      discord: "https://discord.gg/streamverse",
      instagram: "https://instagram.com/streamverse",
      twitter: "https://twitter.com/streamverse",
    }
  },

  // Chaves de ativação e desativação de Recursos Visuais e Funcionais (Feature Flags)
  features: {
    // Iluminação e Atmosfera Visual
    globalAmbilight: true,          // Liga/Desliga a iluminação ambiente global e partículas no fundo
    heroGlow: false,                // Liga/Desliga o feixe de luz roxa sob a caixa do IMDb na Home
    dynamicHeroTypography: true,    // Liga/Desliga o sistema dinâmico de fontes na Hero
    otakuPremium: false,            // Liga/Desliga a atmosfera premium japonesa na aba Animes (pétalas, sakura)
    dynamicAnimeBackground: true,   // Usa imagens de animes em alta do TMDB no fundo das páginas em vez de cor sólida
    enableGenreAtmosphere: false,    // Liga/Desliga o sistema de atmosfera dinâmica por gênero nas páginas de detalhes
    enableSpidermanAnimation: false, // Liga/Desliga a animação interativa da aranha virtual
    enableCustomCursors: false,      // Liga/Desliga o sistema premium de cursores dinâmicos customizados

    // Layouts e Navegação
    crunchyrollStyleLayout: false,  // Ativa o design de grid e botões idêntico à referência Crunchyroll para Animes
    showAnimesOnHome: true,         // Se deve incluir carrosséis de animes na página inicial principal
    premiumHomeLayout: true,        // Ativa a estrutura ideal de catálogo (mistura moderna de Netflix, Prime e Crunchyroll)
    enableNotifications: false,      // Ativa o sistema de sininho e alertas de novos episódios/lançamentos na Navbar

    // Infraestrutura e Performance
    catalogSync: true,              // Ativa o sistema de sincronização automática com TMDB (CatalogSyncService)
    securityGuard: true,            // Ativa o sistema de segurança de impressão digital do navegador contra bots
    extendedCatalogs: true,         // Ativa catálogos super populados e extensos nas abas de Filmes, Séries e Animes
  },

  // Configurações da Seção Hero (Banner Principal do Topo da Home)
  hero: {
    // Títulos de filmes/séries customizados que você deseja que apareçam rotacionando na Hero.
    // O sistema fará a busca automática no TMDB para preencher imagens e informações.
    // Se deixar vazio [], ele usará os títulos "Em Alta (Trending)" do TMDB por padrão.
    customTitles: [
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    // Duração (em milissegundos) que cada slide fica ativo antes de mudar
    autoplayIntervalMs: 10000,
  },

  // Parâmetros de Segurança e Proteção de Servidor
  security: {
    rateLimitApiPerMinute: 60,      // Máximo de requisições por minuto permitidas por IP nas rotas de API
    rateLimitPagePerMinute: 120,    // Máximo de requisições de renderização de páginas por minuto por IP
    shadowThrottleMs: 2000,         // Delay artificial (ms) aplicado discretamente a requisições de clientes suspeitos
    blockBadBots: true,             // Bloqueio de spiders e web scrapers maliciosos conhecidos
    wafEnabled: true,               // Web Application Firewall ativo (bloqueia XSS, SQL injection, Path Traversal)
    cspEnabled: true,               // Ativa cabeçalhos rígidos de Content Security Policy
  },

  // Configurações do Player de Vídeo Interno
  player: {
    defaultResolution: "1080p",     // Resolução padrão inicial ('1080p', '720p', '480p')
    autoResumeProgress: true,       // Retoma o vídeo do ponto exato onde o usuário parou
    doubleClickFullscreen: true,   // Ativa tela cheia com dois cliques rápidos sobre o player
    keyboardShortcuts: true,        // Ativa atalhos de teclado (Espaço = Play/Pause, Setas = Avançar/Voltar, F = Fullscreen)
    warningDismissTimeDays: 7,      // Período que o aviso de anúncios/segurança do player externo fica descartado
  }
};

// -----------------------------------------------------------------------------
// 2. CONFIGURAÇÃO DO AMBIANCE MODE (ambientLightingConfig)
// -----------------------------------------------------------------------------
export const ambientLightingConfig = {
  enabled: true,                    // Liga/Desliga globalmente o sistema de iluminação cinematográfica Ambilight
  mode: "auto",                     // Modo de operação ('auto' = extrai da capa, 'genre' = usa paleta de gênero)
  intensity: 0.7,                  // Intensidade/opacidade das cores projetadas no background (0.0 a 1.0)
  blur: 80,                         // Nível do desfoque gaussiano em pixels nos focos de luz (calc. dinâmico)
  saturation: 0.2,                 // Multiplicador de saturação das cores extraídas para torná-las mais cinematográficas
  brightness: 0.9,                 // Multiplicador de brilho para garantir que o fundo nunca clareie demais os textos
  adaptiveQuality: true,            // Adapta as camadas de luz conforme o dispositivo (PC Ultra/High vs Celular Medium)
  cachePalettes: true,              // Memoriza paletas extraídas em memória RAM para carregamento instantâneo
  respectReducedMotion: true,       // Desliga animações de deriva (drift) em sistemas que preferem redução de movimento
  disableOnLowEndDevices: false,    // Desativa totalmente o Ambilight em dispositivos móveis muito antigos

  // Paleta de fallback segura se houver falha de CORS ao baixar o poster
  fallbackPalette: ["#0A0C10", "#111827", "#3b0764"],

  // Páginas onde a iluminação dinâmica deve ser renderizada
  pages: {
    movie: true,                    // Habilitado na página de detalhes de Filmes
    series: true,                   // Habilitado na página de detalhes de Séries
    anime: true,                    // Habilitado na página de detalhes de Animes
    episode: true,                  // Habilitado na página de episódios individuais
    character: false                // Habilitado em páginas de personagens (se existirem)
  }
};

// -----------------------------------------------------------------------------
// 3. CONFIGURAÇÃO DE ANÚNCIOS NATIVOS E ELEGANTES (adsConfig)
// -----------------------------------------------------------------------------
export const adsConfig = {
  enabled: false,                     // Liga/Desliga globalmente todo o sistema de anúncios do site
  showPreRoll: true,                 // Exibe anúncio de 5s antes do player iniciar (com botão pular)
  showHomeBanner: true,              // Exibe banners patrocinados refinados entre as linhas da Home
  showDetailsSidebar: true,          // Exibe cards patrocinados sutis nas páginas de detalhes
  sessionImpressionsLimit: 4,        // Quantidade máxima de anúncios exibidos por sessão do usuário

  // Lista de campanhas de marcas reais e promocionais (carregadas de forma rotativa)
  campaigns: [
    {
      id: "sv-premium",
      title: "StreamVerse Premium",
      description: "Assista seus filmes e animes favoritos sem anúncio nenhum, em qualidade Ultra-HD 4K HDR e com som surround 7.1. Assine agora mesmo!",
      badge: "STREAMVERSE PLUS",
      buttonText: "Seja Premium por R$ 9,90",
      targetUrl: "/premium",
      bgColor: "linear-gradient(135deg, #1e0b36 0%, #0d041a 100%)",
      borderColor: "rgba(143, 68, 255, 0.25)",
      accentColor: "#8F44FF"
    },
    {
      id: "crunchy-promo",
      title: "Crunchyroll Premium",
      description: "Experimente 14 dias grátis da maior plataforma de animes do mundo! Assista aos episódios simulcast logo após a exibição no Japão.",
      badge: "PARCEIRO OFICIAL",
      buttonText: "Começar Teste Grátis",
      targetUrl: "https://crunchyroll.com",
      bgColor: "linear-gradient(135deg, #2b170c 0%, #0f0703 100%)",
      borderColor: "rgba(244, 117, 33, 0.25)",
      accentColor: "#F47521"
    },
    {
      id: "sony-playstation",
      title: "PlayStation 5 Pro",
      description: "Eleve sua jogabilidade a níveis extraordinários. Gráficos ultra-realistas com Ray Tracing avançado e tempos de carregamento instantâneos.",
      badge: "PROMOÇÃO SONY",
      buttonText: "Descubra o PS5 Pro",
      targetUrl: "https://playstation.com",
      bgColor: "linear-gradient(135deg, #0a142c 0%, #03060f 100%)",
      borderColor: "rgba(0, 112, 204, 0.25)",
      accentColor: "#0070CC"
    }
  ]
};

// -----------------------------------------------------------------------------
// 4. CONFIGURAÇÃO DO SISTEMA PREMIUM DE APOIO (supportSystemConfig)
// -----------------------------------------------------------------------------
export const supportSystemConfig = {
  enabled: true,                       // Ativa/desativa globalmente o sistema de apoio à plataforma
  showOnlyAfterMinutes: 1,             // Tempo mínimo acumulado em minutos para começar a exibir (8 min no original, reduzido para teste rápido e ajustável)
  minimumSessions: 1,                  // Número mínimo de sessões (visitas) antes de exibir (3 no original, 2 para teste mais rápido)
  cooldownDays: 3,                     // Dias de espera antes de reexibir após o usuário fechar ("Talvez depois")
  neverInterruptPlayback: true,        // Nunca exibir ou interromper enquanto o player estiver reproduzindo
  disableOnMobileFullscreen: true,     // Desativar em tela cheia de dispositivos móveis
  rememberDismissedState: true,        // Lembrar se o usuário descartou e respeitar o cooldown

  // Detalhes para apoio (Chave Pix, QR Code simulado e links de doação)
  pix: {
    key: "053.795.071-07",
    recipient: "João Philippe de Oliveira Boechat",
    city: "Rio de Janeiro",
    description: "Apoio StreamVerse",
  },

  supportUrls: {
    kofi: "https://ko-fi.com/streamverse",
    patreon: "https://patreon.com/streamverse",
    crypto: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" // Ethereum / BSC address
  }
};


