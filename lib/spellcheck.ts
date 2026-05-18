/**
 * spelling-tolerant fuzzy search and spelling correction utility
 * Tailored for children queries (e.g. "patruia" -> "Patrulha Canina", "kuti ropi" -> "Cut the Rope")
 */

import { KIDS_GAMES_CATALOG, GameItem } from '@/config/kidsGames';

// Portuguese Phonetic Mappings & Common Typos Dictionary
const KIDS_DICTIONARY: { [key: string]: string } = {
  // Games
  "cut the rope": "Cut the Rope 1",
  "corta corda": "Cut the Rope 1",
  "corta a corda": "Cut the Rope 1",
  "cut the rope 1": "Cut the Rope 1",
  "cut the rope 2": "Cut the Rope 2",
  "cut the rope experiments": "Cut the Rope: Experimentos",
  "cut the rope experimento": "Cut the Rope: Experimentos",
  "om nom": "Cut the Rope 1",
  "omnom": "Cut the Rope 1",
  "monstrinho verde": "Cut the Rope 1",
  "cuti rope": "Cut the Rope 1",
  "kuti rope": "Cut the Rope 1",
  "cut the ropi": "Cut the Rope 1",
  "corrida espacial 3d": "Corrida Espacial 3D",
  "corrida espacial": "Corrida Espacial 3D",
  "corrida 3d": "Corrida Espacial 3D",
  "slope racing": "Corrida Espacial 3D",
  "slope racing 3d": "Corrida Espacial 3D",
  "moto x3m": "Moto X3M: Terra dos Doces",
  "moto x3m doces": "Moto X3M: Terra dos Doces",
  "corrida de moto": "Moto X3M: Terra dos Doces",
  "moto de doce": "Moto X3M: Terra dos Doces",
  "festa das bonecas lol": "Festa das Bonecas LOL",
  "boneca lol": "Festa das Bonecas LOL",
  "bonecas lol": "Festa das Bonecas LOL",
  "lol surprise": "Festa das Bonecas LOL",
  "desfile de primavera lol": "Desfile de Primavera LOL",
  "lol desfile": "Desfile de Primavera LOL",
  "basquete estelar kids": "Basquete Estelar Kids",
  "basquete stars": "Basquete Estelar Kids",
  "basquete": "Basquete Estelar Kids",
  "basqueti": "Basquete Estelar Kids",
  "jogo de basquete": "Basquete Estelar Kids",
  "boxe maluco 3d": "Boxe Maluco 3D",
  "boxe maluco": "Boxe Maluco 3D",
  "boxe 3d": "Boxe Maluco 3D",
  "boxe": "Boxe Maluco 3D",
  "jogo de boxe": "Boxe Maluco 3D",
  "boche": "Boxe Maluco 3D",
  "astronauta impostor": "Astronauta Impostor",
  "among us": "Astronauta Impostor",
  "amongas": "Astronauta Impostor",
  "amon as": "Astronauta Impostor",
  "impostor": "Astronauta Impostor",
  "magikmon": "Magikmon: Escola de Monstros",
  "magicmon": "Magikmon: Escola de Monstros",
  "escola de monstros": "Magikmon: Escola de Monstros",
  "jogo de monstros": "Magikmon: Escola de Monstros",
  "monstrinhos": "Magikmon: Escola de Monstros",
  "irmãos coloridos huggy": "Irmãos Coloridos Huggy",
  "huggy wuggy": "Irmãos Coloridos Huggy",
  "huggy": "Irmãos Coloridos Huggy",
  "hugy": "Irmãos Coloridos Huggy",
  "wuggy": "Irmãos Coloridos Huggy",
  "jogo do huggy": "Irmãos Coloridos Huggy",
  "futebol divertido chinko": "Futebol Divertido Chinko",
  "futebol chinko": "Futebol Divertido Chinko",
  "futebol": "Futebol Divertido Chinko",
  "futibol": "Futebol Divertido Chinko",
  "futeba": "Futebol Divertido Chinko",
  "robô dash master": "Robô Dash Master",
  "robo dash": "Robô Dash Master",
  "robo": "Robô Dash Master",
  "dash master": "Robô Dash Master",
  "batalha de torres mágicas": "Batalha de Torres Mágicas",
  "batalha de torres": "Batalha de Torres Mágicas",
  "torres mágicas": "Batalha de Torres Mágicas",
  "torre": "Batalha de Torres Mágicas",
  "defesa de torre": "Batalha de Torres Mágicas",

  // Movies / Series / Animes (Common Kids Queries)
  "patrulha canina": "Patrulha Canina",
  "patruia canina": "Patrulha Canina",
  "patrula canina": "Patrulha Canina",
  "patruia": "Patrulha Canina",
  "paw patrol": "Patrulha Canina",
  "homem aranha": "Homem-Aranha",
  "homem arania": "Homem-Aranha",
  "homen aranha": "Homem-Aranha",
  "spider man": "Homem-Aranha",
  "spiderman": "Homem-Aranha",
  "homem de ferro": "Homem de Ferro",
  "homem de fero": "Homem de Ferro",
  "homen de ferro": "Homem de Ferro",
  "iron man": "Homem de Ferro",
  "peppa pig": "Peppa Pig",
  "pepa pig": "Peppa Pig",
  "pepa": "Peppa Pig",
  "peppa": "Peppa Pig",
  "shrek": "Shrek",
  "xerek": "Shrek",
  "cherec": "Shrek",
  "frozen": "Frozen",
  "frozin": "Frozen",
  "elza": "Frozen",
  "elsa": "Frozen",
  "mickey mouse": "Mickey Mouse",
  "mickey": "Mickey Mouse",
  "mici": "Mickey Mouse",
  "miqui": "Mickey Mouse",
  "toy story": "Toy Story",
  "toi stori": "Toy Story",
  "woody": "Toy Story",
  "bob esponja": "Bob Esponja",
  "bob espoja": "Bob Esponja",
  "minions": "Minions",
  "minios": "Minions",
  "divertida mente": "Divertida Mente",
  "divertidamente": "Divertida Mente",
  "naruto": "Naruto",
  "narutu": "Naruto",
  "dragon ball": "Dragon Ball",
  "drago bol": "Dragon Ball",
  "goku": "Dragon Ball",
  "carros": "Carros",
  "caros": "Carros",
  "mcqueen": "Carros",
  "macquin": "Carros",
  "ben 10": "Ben 10",
  "ben dez": "Ben 10",
  "benten": "Ben 10",
  "chaves": "Chaves",
  "chavis": "Chaves"
};

// Computes standard Levenshtein distance between two strings
export function getLevenshteinDistance(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Strip Portuguese accents and convert to simple base characters
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .trim();
}

// Convert string to a Portuguese phonetic key to bridge common sound typos
export function toPhoneticKey(str: string): string {
  let normalized = normalizeString(str);
  
  // Replace silent/sound-alike prefixes and groups
  normalized = normalized.replace(/\blh/g, 'l');
  normalized = normalized.replace(/lh/g, 'l');
  normalized = normalized.replace(/li/g, 'l');
  normalized = normalized.replace(/nh/g, 'n');
  normalized = normalized.replace(/ni/g, 'n');
  normalized = normalized.replace(/ch/g, 'x');
  normalized = normalized.replace(/sh/g, 'x');
  normalized = normalized.replace(/sc/g, 's');
  normalized = normalized.replace(/xc/g, 's');
  normalized = normalized.replace(/ç/g, 'c');
  normalized = normalized.replace(/w/g, 'v');
  normalized = normalized.replace(/y/g, 'i');
  normalized = normalized.replace(/k/g, 'c');
  normalized = normalized.replace(/qu/g, 'c');
  
  // Strip initial silent H
  normalized = normalized.replace(/\bh([aeiou])/g, '$1');
  
  // Common end-word vowels swapping
  normalized = normalized.replace(/u\b/g, 'o');
  normalized = normalized.replace(/i\b/g, 'e');
  normalized = normalized.replace(/m\b/g, 'n');
  
  // Remove double letters
  normalized = normalized.replace(/([a-z])\1+/g, '$1');
  
  return normalized.replace(/\s+/g, '');
}

/**
 * Checks a search query against the dictionary and fuzzy catalogs.
 * Returns the best corrected term if the confidence is high.
 */
export function correctSearchQuery(query: string): { 
  corrected: string; 
  wasCorrected: boolean; 
  original: string;
} {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { corrected: trimmed, wasCorrected: false, original: trimmed };
  }

  const normQuery = normalizeString(trimmed);
  const phoneticQuery = toPhoneticKey(trimmed);

  // 1. Direct dictionary check (exact mapping or exact normalized mapping)
  if (KIDS_DICTIONARY[normQuery]) {
    return { corrected: KIDS_DICTIONARY[normQuery], wasCorrected: true, original: trimmed };
  }

  // 2. Iterate dictionary to find the best match using Levenshtein distance and Phonetic keys
  let bestTerm = "";
  let bestScore = 999;
  let maxLen = 0;

  for (const [key, val] of Object.entries(KIDS_DICTIONARY)) {
    const normKey = normalizeString(key);
    const phoneticKeyStr = toPhoneticKey(key);

    // Phonetic matches are high confidence
    if (phoneticQuery === phoneticKeyStr) {
      return { corrected: val, wasCorrected: true, original: trimmed };
    }

    // Levenshtein match
    const dist = getLevenshteinDistance(normQuery, normKey);
    const length = Math.max(normQuery.length, normKey.length);
    const ratio = dist / length;

    // A similarity ratio below 0.35 is very close!
    if (ratio < 0.35 && dist < bestScore) {
      bestScore = dist;
      bestTerm = val;
      maxLen = length;
    }
  }

  if (bestTerm && bestScore < 4) {
    return { corrected: bestTerm, wasCorrected: true, original: trimmed };
  }

  // 3. Fallback: Check against actual local kids game titles
  let bestGameTitle = "";
  let bestGameScore = 999;

  for (const game of KIDS_GAMES_CATALOG) {
    const normTitle = normalizeString(game.title);
    const phoneticTitle = toPhoneticKey(game.title);

    if (phoneticQuery === phoneticTitle) {
      return { corrected: game.title, wasCorrected: true, original: trimmed };
    }

    const dist = getLevenshteinDistance(normQuery, normTitle);
    const length = Math.max(normQuery.length, normTitle.length);
    const ratio = dist / length;

    if (ratio < 0.4 && dist < bestGameScore) {
      bestGameScore = dist;
      bestGameTitle = game.title;
    }
  }

  if (bestGameTitle && bestGameScore < 4) {
    return { corrected: bestGameTitle, wasCorrected: true, original: trimmed };
  }

  return { corrected: trimmed, wasCorrected: false, original: trimmed };
}

/**
 * Filter kids games using standard query + correction logic.
 * Returns both corrected items AND high-relevance fuzzy candidates.
 */
export function fuzzyFilterKidsGames(
  games: GameItem[],
  query: string,
  selectedCategory: string
): {
  filtered: GameItem[];
  correctedQuery: string;
  wasCorrected: boolean;
} {
  if (!query.trim()) {
    const list = selectedCategory === "Tudo" 
      ? games 
      : games.filter(g => g.category === selectedCategory);
    return { filtered: list, correctedQuery: query, wasCorrected: false };
  }

  const { corrected, wasCorrected } = correctSearchQuery(query);
  const queryToUse = wasCorrected ? corrected : query;

  const normQuery = normalizeString(queryToUse);
  const phoneticQuery = toPhoneticKey(queryToUse);

  const filtered = games.filter(game => {
    const matchesCategory = selectedCategory === "Tudo" || game.category === selectedCategory;
    if (!matchesCategory) return false;

    const normTitle = normalizeString(game.title);
    const normDesc = normalizeString(game.description);
    const phoneticTitle = toPhoneticKey(game.title);

    // Matches if title contains query, or query phonetic key is closely related
    const matchesTitle = normTitle.includes(normQuery) || 
                         normQuery.includes(normTitle) ||
                         phoneticTitle.includes(phoneticQuery) ||
                         phoneticQuery.includes(phoneticTitle);

    const matchesDesc = normDesc.includes(normQuery);
    const matchesTags = game.tags.some(tag => {
      const normTag = normalizeString(tag);
      return normTag.includes(normQuery) || toPhoneticKey(tag).includes(phoneticQuery);
    });

    // Check Levenshtein distance on title
    const distance = getLevenshteinDistance(normQuery, normTitle);
    const matchesFuzzy = distance <= Math.max(2, Math.floor(normTitle.length * 0.4));

    return matchesTitle || matchesDesc || matchesTags || matchesFuzzy;
  });

  return {
    filtered,
    correctedQuery: queryToUse,
    wasCorrected
  };
}
