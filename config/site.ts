export const siteConfig = {
  features: {
    globalAmbilight: true, // Liga/Desliga a iluminação ambiente global e partículas
    heroGlow: false, // Liga/Desliga o feixe de luz roxa sob a caixa do IMDb
    dynamicHeroTypography: true, // Liga/Desliga o sistema dinâmico de fontes para a Hero
    otakuPremium: true, // Liga/Desliga a atmosfera premium japonesa na aba Animes
    crunchyrollStyleLayout: false, // Ativa o design de grid e botões idêntico à referência Crunchyroll/Anime
    showAnimesOnHome: true, // Se deve incluir carrosséis de anime na página inicial
    premiumHomeLayout: true, // Ativa a estrutura ideal de catálogo (mistura Netflix/Prime/Crunchyroll)
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
