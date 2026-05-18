export const kidsGamesConfig = {
  enabled: true,
  provider: "gamepix",
  showOnlyCurated: true,
  enableSearch: true,
  enableCategories: true,
  enableFullscreen: true,
  loadGameOnlyOnUserAction: true,
  allowedDomains: [
    "crazygames.com",
    "www.crazygames.com",
    "games.crazygames.com",
    "gamedistribution.com",
    "html5.gamedistribution.com",
    "gamepix.com",
    "play.gamepix.com",
    "games.gamepix.com",
    "games.assets.gamepix.com"
  ],
  blockedTags: [
    "horror",
    "blood",
    "gore",
    "shooter",
    "weapon",
    "casino",
    "gambling",
    "adult",
    "mature"
  ],
  allowedTags: [
    "kids",
    "puzzle",
    "casual",
    "educational",
    "drawing",
    "music",
    "animals",
    "adventure",
    "platform",
    "memory",
    "logic"
  ]
};

export interface GameItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  embedUrl: string;
  category: string;
  ageRating: string;
  tags: string[];
  likes: number;
  playersCount: string;
  bgColor: string; // Vibrant 3D gradients for cards
  textColor: string;
  accentColor: string;
}

export const KIDS_GAMES_CATALOG: GameItem[] = [
  {
    id: "cut-the-rope",
    title: "Cut the Rope 1",
    description: "Alimente o monstrinho Om Nom com doces deliciosos! Corte as cordas certas, recolha as estrelas douradas e resolva os quebra-cabeças mais divertidos do mundo!",
    thumbnail: "https://games.assets.gamepix.com/40071/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/cut-the-rope/embed?sid=1",
    category: "Jogos Inteligentes",
    ageRating: "Livre",
    tags: ["puzzle", "lógica", "física", "casual"],
    likes: 98,
    playersCount: "45K jogando",
    bgColor: "from-emerald-400 to-green-600",
    textColor: "text-emerald-950",
    accentColor: "bg-emerald-400"
  },
  {
    id: "cut-the-rope-2",
    title: "Cut the Rope 2",
    description: "Doces! As aventuras do Om Nom continuam com novos monstrinhos amigos, missões desafiadoras e mecânicas incríveis baseadas na física!",
    thumbnail: "https://games.assets.gamepix.com/40214/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/cut-the-rope-2/embed?sid=1",
    category: "Jogos Inteligentes",
    ageRating: "Livre",
    tags: ["puzzle", "lógica", "física", "bichinhos"],
    likes: 97,
    playersCount: "78K jogando",
    bgColor: "from-teal-400 to-emerald-600",
    textColor: "text-teal-950",
    accentColor: "bg-teal-400"
  },
  {
    id: "cut-the-rope-experiments",
    title: "Cut the Rope: Experimentos",
    description: "Ajude o simpático cientista maluco a estudar os hábitos doces do Om Nom em mais de 200 níveis cheios de ventosas, lançadores e engenhocas!",
    thumbnail: "https://games.assets.gamepix.com/40337/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/cut-the-rope-experiments/embed?sid=1",
    category: "Jogos Inteligentes",
    ageRating: "Livre",
    tags: ["puzzle", "física", "lógica", "ciência"],
    likes: 96,
    playersCount: "54K jogando",
    bgColor: "from-green-400 to-teal-700",
    textColor: "text-green-950",
    accentColor: "bg-green-400"
  },
  {
    id: "slope-racing-3d",
    title: "Corrida Espacial 3D",
    description: "Role em velocidade máxima em um mundo futurista 3D! Desvie dos obstáculos de neon e vença a gravidade nessa corrida super emocionante!",
    thumbnail: "https://games.assets.gamepix.com/GS7CA/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/slope-racing-3d/embed?sid=1",
    category: "Corridas Malucas",
    ageRating: "Livre",
    tags: ["ação", "velocidade", "3D", "casual"],
    likes: 95,
    playersCount: "120K jogando",
    bgColor: "from-sky-400 to-blue-600",
    textColor: "text-sky-950",
    accentColor: "bg-sky-400"
  },
  {
    id: "moto-x3m-spooky-land",
    title: "Moto X3M: Terra dos Doces",
    description: "Acelere sua moto fofa por pistas assustadoramente divertidas com abóboras, doces gigantes, rampas e piruetas iradas no ar!",
    thumbnail: "https://games.assets.gamepix.com/7MS9M/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/moto-x3m-spooky-land/embed?sid=1",
    category: "Corridas Divertidas",
    ageRating: "Livre",
    tags: ["moto", "acrobacia", "ação", "casual"],
    likes: 99,
    playersCount: "67K jogando",
    bgColor: "from-orange-400 to-red-600",
    textColor: "text-orange-950",
    accentColor: "bg-orange-400"
  },
  {
    id: "lol-surprise-insta-party",
    title: "Festa das Bonecas LOL",
    description: "Escolha os vestidos mais coloridos, maquiagens brilhantes e acessórios mágicos para a grande festa das bonecas LOL no Instagram!",
    thumbnail: "https://games.assets.gamepix.com/P11VR/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/lol-surprise-insta-party-divas/embed?sid=1",
    category: "Criatividade",
    ageRating: "Livre",
    tags: ["bonecas", "criar", "vestir", "cores"],
    likes: 94,
    playersCount: "28K jogando",
    bgColor: "from-pink-400 to-rose-600",
    textColor: "text-pink-950",
    accentColor: "bg-pink-400"
  },
  {
    id: "basketball-stars-kids",
    title: "Basquete Estelar Kids",
    description: "Faça cestas incríveis de três pontos com seus personagens favoritos! Um jogo de basquete super divertido para desafiar seus reflexos!",
    thumbnail: "https://games.assets.gamepix.com/35LBE/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/basketball-stars/embed?sid=1",
    category: "Aventuras Divertidas",
    ageRating: "Livre",
    tags: ["esporte", "basquete", "agilidade", "amigos"],
    likes: 93,
    playersCount: "34K jogando",
    bgColor: "from-yellow-400 to-amber-600",
    textColor: "text-yellow-950",
    accentColor: "bg-yellow-400"
  },
  {
    id: "drunken-boxing-3d",
    title: "Boxe Maluco 3D",
    description: "Controle bonecos de pano engraçados e dê socos rápidos para vencer o combate de forma super divertida e hilária com seus amigos!",
    thumbnail: "https://games.assets.gamepix.com/20XI2/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/drunken-boxing-2/embed?sid=1",
    category: "Aventuras Divertidas",
    ageRating: "Livre",
    tags: ["luta", "ragdoll", "engraçado", "3D"],
    likes: 92,
    playersCount: "22K jogando",
    bgColor: "from-violet-400 to-purple-600",
    textColor: "text-violet-950",
    accentColor: "bg-violet-400"
  },
  {
    id: "among-at-easter-space",
    title: "Astronauta Impostor",
    description: "Ajude a preparar a nave espacial de Páscoa consertando os motores, mas tenha muito cuidado com o impostor escondido que tenta parar a missão!",
    thumbnail: "https://games.assets.gamepix.com/NG7TT/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/among-at-easter/embed?sid=1",
    category: "Espaço & Robôs",
    ageRating: "Livre",
    tags: ["astronauta", "espaço", "mistério", "amigos"],
    likes: 95,
    playersCount: "58K jogando",
    bgColor: "from-indigo-400 to-blue-700",
    textColor: "text-indigo-950",
    accentColor: "bg-indigo-400"
  },
  {
    id: "magikmon-adventure",
    title: "Magikmon: Escola de Monstros",
    description: "Capture monstros fofos e mágicos nas florestas! Treine suas criaturas e vença os desafios da grande escola de magia!",
    thumbnail: "https://games.assets.gamepix.com/40434/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/magikmon/embed?sid=1",
    category: "Fantasia",
    ageRating: "Livre",
    tags: ["monstrinhos", "aventura", "magia", "combate"],
    likes: 96,
    playersCount: "41K jogando",
    bgColor: "from-amber-400 to-orange-600",
    textColor: "text-amber-950",
    accentColor: "bg-amber-400"
  },
  {
    id: "red-blue-huggy",
    title: "Irmãos Coloridos Huggy",
    description: "Trabalhe em equipe com os irmãos azul e vermelho! Encontre as chaves mágicas e escape de cada nível cheio de desafios divertidos!",
    thumbnail: "https://games.assets.gamepix.com/DDY8C/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/red-and-blue-stickman-huggy/embed?sid=1",
    category: "Aventuras Divertidas",
    ageRating: "Livre",
    tags: ["cooperação", "plataforma", "aventura", "colorido"],
    likes: 91,
    playersCount: "17K jogando",
    bgColor: "from-rose-400 to-pink-600",
    textColor: "text-rose-950",
    accentColor: "bg-rose-400"
  },
  {
    id: "foot-chinko-soccer",
    title: "Futebol Divertido Chinko",
    description: "Chute a bola com efeito, passe pelos goleiros mais engraçados do mundo e vença o grande campeonato internacional de futebol!",
    thumbnail: "https://games.assets.gamepix.com/20048/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/foot-chinko/embed?sid=1",
    category: "Arcade Mágico",
    ageRating: "Livre",
    tags: ["futebol", "esporte", "física", "gol"],
    likes: 90,
    playersCount: "19K jogando",
    bgColor: "from-lime-400 to-green-600",
    textColor: "text-lime-950",
    accentColor: "bg-lime-400"
  },
  {
    id: "dash-masters-robot",
    title: "Robô Dash Master",
    description: "Pule, desvie de robôs espinhosos e voe alto com seu jato espacial! Um jogo super rápido de agilidade que as crianças amam!",
    thumbnail: "https://games.assets.gamepix.com/ADHH2/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/dash-masters/embed?sid=1",
    category: "Espaço & Robôs",
    ageRating: "Livre",
    tags: ["robô", "ação", "vôo", "agilidade"],
    likes: 89,
    playersCount: "11K jogando",
    bgColor: "from-teal-400 to-cyan-600",
    textColor: "text-teal-950",
    accentColor: "bg-teal-400"
  },
  {
    id: "tower-crush-defense",
    title: "Batalha de Torres Mágicas",
    description: "Construa sua torre gigante de até 6 andares, adicione canhões de água e laser e proteja o seu reino de forma super estratégica!",
    thumbnail: "https://games.assets.gamepix.com/T02T0/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/tower-crush/embed?sid=1",
    category: "Jogos Inteligentes",
    ageRating: "Livre",
    tags: ["estratégia", "torre", "defesa", "batalha"],
    likes: 95,
    playersCount: "54K jogando",
    bgColor: "from-cyan-400 to-blue-700",
    textColor: "text-cyan-950",
    accentColor: "bg-cyan-400"
  },
  {
    id: "lol-surprise-spring",
    title: "Desfile de Primavera LOL",
    description: "Crie roupas de flores e looks super alegres para as bonequinhas desfilarem na passarela da primavera de forma linda!",
    thumbnail: "https://games.assets.gamepix.com/LNI17/thumbnail/small.png",
    embedUrl: "https://play.gamepix.com/lol-surprise-fresh-spring-look/embed?sid=1",
    category: "Criatividade",
    ageRating: "Livre",
    tags: ["vestir", "primavera", "bonecas", "cores"],
    likes: 94,
    playersCount: "31K jogando",
    bgColor: "from-fuchsia-400 to-pink-600",
    textColor: "text-fuchsia-950",
    accentColor: "bg-fuchsia-400"
  }
];

export const CATEGORIES_LIST = [
  "Aventuras Divertidas",
  "Espaço & Robôs",
  "Jogos Inteligentes",
  "Criatividade",
  "Dinossauros",
  "Fantasia",
  "Relaxantes",
  "Música & Ritmo",
  "Corridas Divertidas",
  "Arcade Mágico"
];
