'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Zap, 
  Check,
  X,
  Play
} from 'lucide-react';

interface KidsMascotGamerHUDProps {
  childName?: string;
  childGender?: 'boy' | 'girl' | 'neutral';
}

interface Quest {
  id: number;
  icon: string;
  tag: string;
  title: string;
  text: string;
  girlText: string;
  neutralText: string;
}

// 30 Unique Cosmic Quest Habits for a full month of space adventure!
const THIRTY_DAY_QUESTS: Quest[] = [
  {
    id: 1,
    icon: "🧼",
    tag: "Higiene Espacial",
    title: "Lavar as Mãos",
    text: "astronauta, sabia que lavar bem as mãos antes das refeições protege seu corpo como um escudo espacial contra germes invasores? 🧼✨",
    girlText: "campeã, sabia que lavar bem as mãos antes das refeições protege seu corpo como um escudo espacial contra germes invasores? 🧼✨",
    neutralText: "astronauta, sabia que lavar bem as mãos antes das refeições protege seu corpo como um escudo espacial contra germes invasores? 🧼✨"
  },
  {
    id: 2,
    icon: "🪥",
    tag: "Sorriso Estelar",
    title: "Escovar os Dentes",
    text: "Escovar os dentes após comer limpa as estrelinhas do seu sorriso e o deixa brilhando mais que uma supernova! 🪥🌟",
    girlText: "Escovar os dentes após comer limpa as estrelinhas do seu sorriso e o deixa brilhando mais que uma supernova! 🪥🌟",
    neutralText: "Escovar os dentes após comer limpa as estrelinhas do seu sorriso e o deixa brilhando mais que uma supernova! 🪥🌟"
  },
  {
    id: 3,
    icon: "🥤",
    tag: "Poder de Hidratação",
    title: "Beber um Copo d'Água",
    text: "Até os maiores heróis precisam de combustível líquido! Beba um copo de água fresquinha agora para recarregar sua energia cósmica! 🥤🛰️",
    girlText: "Até as maiores heroínas precisam de combustível líquido! Beba um copo de água fresquinha agora para recarregar sua energia cósmica! 🥤🛰️",
    neutralText: "Até os maiores astronautas precisam de combustível líquido! Beba um copo de água fresquinha agora para recarregar sua energia cósmica! 🥤🛰️"
  },
  {
    id: 4,
    icon: "📚",
    tag: "Super Cérebro",
    title: "Dever de Casa",
    text: "Hora de exercitar seu supercérebro! Fazer o dever de casa com capricho vai te transformar no cientista mais inteligente da galáxia! 📚💡",
    girlText: "Hora de exercitar seu supercérebro! Fazer o dever de casa com capricho vai te transformar na cientista mais inteligente da galáxia! 📚💡",
    neutralText: "Hora de exercitar seu supercérebro! Fazer o dever de casa com capricho vai te transformar no cientista mais brilhante da galáxia! 📚💡"
  },
  {
    id: 5,
    icon: "🧸",
    tag: "Nave Organizada",
    title: "Organizar Brinquedos",
    text: "Que tal deixar a sua nave espacial (o seu quarto!) super arrumada? Guardar os brinquedos mostra que você é um excelente capitão! 🧸🛸",
    girlText: "Que tal deixar a sua nave espacial (o seu quarto!) super arrumada? Guardar os brinquedos mostra que você é uma excelente capitã! 🧸🛸",
    neutralText: "Que tal deixar a sua nave espacial (o seu quarto!) super arrumada? Guardar os brinquedos mostra que você é um excelente astronauta! 🧸🛸"
  },
  {
    id: 6,
    icon: "🍎",
    tag: "Fruta Mágica",
    title: "Comer uma Fruta",
    text: "Comer uma maçã, banana ou outra fruta deliciosa hoje vai te dar super-velocidade espacial graças às vitaminas da natureza! 🍎💫",
    girlText: "Comer uma maçã, banana ou outra fruta deliciosa hoje vai te dar super-velocidade espacial graças às vitaminas da natureza! 🍎💫",
    neutralText: "Comer uma maçã, banana ou outra fruta deliciosa hoje vai te dar super-velocidade espacial graças às vitaminas da natureza! 🍎💫"
  },
  {
    id: 7,
    icon: "🧹",
    tag: "Missão Copiloto",
    title: "Ajudar nas Tarefas",
    text: "Ajudar a limpar a mesa ou organizar algo em casa mostra que você é o melhor copiloto de toda a nave-família! 🧹🛰️",
    girlText: "Ajudar a limpar a mesa ou organizar algo em casa mostra que você é a melhor copilota de toda a nave-família! 🧹🛰️",
    neutralText: "Ajudar a limpar a mesa ou organizar algo em casa mostra que você é o melhor copiloto de toda a nave-família! 🧹🛰️"
  },
  {
    id: 8,
    icon: "🤝",
    tag: "Brilho Cósmico",
    title: "Gentileza do Dia",
    text: "Dizer uma palavra bonita para quem você ama espalha raios de sol e sentimentos bons por toda a órbita da Terra! 🤝💖",
    girlText: "Dizer uma palavra bonita para quem você ama espalha raios de sol e sentimentos bons por toda a órbita da Terra! 🤝💖",
    neutralText: "Dizer uma palavra bonita para quem você ama espalha raios de sol e sentimentos bons por toda a órbita da Terra! 🤝💖"
  },
  {
    id: 9,
    icon: "📵",
    tag: "Descanso Orbital",
    title: "Desplugar da Tela",
    text: "Fazer uma pausa de 30 minutos longe de qualquer tela para brincar ao ar livre ou desenhar protege sua visão de astronauta! 📵👀",
    girlText: "Fazer uma pausa de 30 minutos longe de qualquer tela para brincar ao ar livre ou desenhar protege sua visão de astronauta! 📵👀",
    neutralText: "Fazer uma pausa de 30 minutos longe de qualquer tela para brincar ao ar livre ou desenhar protege sua visão de astronauta! 📵👀"
  },
  {
    id: 10,
    icon: "📖",
    tag: "Portal de Leitura",
    title: "Ler uma História",
    text: "A imaginação é a nossa nave mais rápida! Ler uma página de livro hoje te levará a planetas desconhecidos fantásticos! 📖🪐",
    girlText: "A imaginação é a nossa nave mais rápida! Ler uma página de livro hoje te levará a planetas desconhecidos fantásticos! 📖🪐",
    neutralText: "A imaginação é a nossa nave mais rápida! Ler uma página de livro hoje te levará a planetas desconhecidos fantásticos! 📖🪐"
  },
  {
    id: 11,
    icon: "🚿",
    tag: "Missão Chuveiro",
    title: "Tomar Banho",
    text: "Banho iniciado! Lavar-se bem deixa você pronto para a próxima decolagem com total energia e frescor estelar! 🚿🚀",
    girlText: "Banho iniciado! Lavar-se bem deixa você pronta para a próxima decolagem com total energia e frescor estelar! 🚿🚀",
    neutralText: "Banho iniciado! Lavar-se bem deixa você pronto para a próxima decolagem com total energia e frescor estelar! 🚿🚀"
  },
  {
    id: 12,
    icon: "🥦",
    tag: "Super Nutrientes",
    title: "Comer Verduras",
    text: "Comer salada ou verduras no almoço te dá super-força para levantar foguetes imaginários! 🌱💪",
    girlText: "Comer salada ou verduras no almoço te dá super-força para levantar foguetes imaginários! 🌱💪",
    neutralText: "Comer salada ou verduras no almoço te dá super-força para levantar foguetes imaginários! 🌱💪"
  },
  {
    id: 13,
    icon: "👂",
    tag: "Higiene Auditiva",
    title: "Secar as Orelhas",
    text: "Depois do banho, secar bem as orelhinhas com a toalha impede a entrada de germes da água nas suas antenas de comunicação! 👂🛰️",
    girlText: "Depois do banho, secar bem as orelhinhas com a toalha impede a entrada de germes da água nas suas antenas de comunicação! 👂🛰️",
    neutralText: "Depois do banho, secar bem as orelhinhas com a toalha impede a entrada de germes da água nas suas antenas de comunicação! 👂🛰️"
  },
  {
    id: 14,
    icon: "🪮",
    tag: "Visual de Gala",
    title: "Pentear o Cabelo",
    text: "Pentear seu cabelo hoje te deixa pronto para tirar a foto de identificação dos oficiais mais elegantes da galáxia! 🪮⭐",
    girlText: "Pentear seu cabelo hoje te deixa pronta para tirar a foto de identificação dos oficiais mais elegantes da galáxia! 🪮⭐",
    neutralText: "Pentear seu cabelo hoje te deixa pronto para tirar a foto de identificação dos oficiais mais elegantes da galáxia! 🪮⭐"
  },
  {
    id: 15,
    icon: "👟",
    tag: "Porto de Embarque",
    title: "Guardar os Sapatos",
    text: "Colocar seus sapatos organizados na sapateira limpa o caminho para decolagens seguras na sua casa! 👟🛸",
    girlText: "Colocar seus sapatos organizados na sapateira limpa o caminho para decolagens seguras na sua casa! 👟🛸",
    neutralText: "Colocar seus sapatos organizados na sapateira limpa o caminho para decolagens seguras na sua casa! 👟🛸"
  },
  {
    id: 16,
    icon: "🌱",
    tag: "Eco-Protetor",
    title: "Cuidar da Natureza",
    text: "Regar uma plantinha ou cuidar de uma flor ajuda a produzir oxigênio puro para todos os astronautas da Terra! 🌱💚",
    girlText: "Regar uma plantinha ou cuidar de uma flor ajuda a produzir oxigênio puro para todos os astronautas da Terra! 🌱💚",
    neutralText: "Regar uma plantinha ou cuidar de uma flor ajuda a produzir oxigênio puro para todos os astronautas da Terra! 🌱💚"
  },
  {
    id: 17,
    icon: "🧘",
    tag: "Super Alongamento",
    title: "Esticar o Corpo",
    text: "Fazer 5 alongamentos de super-herói estica suas articulações e prepara seus propulsores físicos para o dia! 🧘💥",
    girlText: "Fazer 5 alongamentos de super-heroína estica suas articulações e prepara seus propulsores físicos para o dia! 🧘💥",
    neutralText: "Fazer 5 alongamentos de astronauta estica suas articulações e prepara seus propulsores físicos para o dia! 🧘💥"
  },
  {
    id: 18,
    icon: "🙏",
    tag: "Força da Gratidão",
    title: "Dizer Obrigado",
    text: "Dizer 'Obrigado' para seus pais por 3 coisas legais hoje faz o coração deles brilhar como o núcleo de uma estrela quente! 🙏💖",
    girlText: "Dizer 'Obrigado' para seus pais por 3 coisas legais hoje faz o coração deles brilhar como o núcleo de uma estrela quente! 🙏💖",
    neutralText: "Dizer 'Obrigado' para seus pais por 3 coisas legais hoje faz o coração deles brilhar como o núcleo de uma estrela quente! 🙏💖"
  },
  {
    id: 19,
    icon: "🍏",
    tag: "Mastigação Lenta",
    title: "Comer Devagar",
    text: "Mastigar cada mordida devagar e saborear o alimento dá super poderes ao seu estômago espacial! 🍏😋",
    girlText: "Mastigar cada mordida devagar e saborear o alimento dá super poderes ao seu estômago espacial! 🍏😋",
    neutralText: "Mastigar cada mordida devagar e saborear o alimento dá super poderes ao seu estômago espacial! 🍏😋"
  },
  {
    id: 20,
    icon: "💨",
    tag: "Mente Zen",
    title: "Respirar Fundo",
    text: "Puxe o ar bem fundo pelo nariz e solte devagar pela boca 5 vezes. Isso recarrega seus escudos de calma e foco cósmicos! 💨🧘",
    girlText: "Puxe o ar bem fundo pelo nariz e solte devagar pela boca 5 vezes. Isso recarrega seus escudos de calma e foco cósmicos! 💨🧘",
    neutralText: "Puxe o ar bem fundo pelo nariz e solte devagar pela boca 5 vezes. Isso recarrega seus escudos de calma e foco cósmicos! 💨🧘"
  },
  {
    id: 21,
    icon: "💅",
    tag: "Escudo Biológico",
    title: "Limpar as Unhas",
    text: "Verificar e pedir para limpar as unhas remove o esconderijo de germes alienígenas microscópicos nas suas patinhas! 💅👾",
    girlText: "Verificar e pedir para limpar as unhas remove o esconderijo de germes alienígenas microscópicos nas suas patinhas! 💅👾",
    neutralText: "Verificar e pedir para limpar as unhas remove o esconderijo de germes alienígenas microscópicos nas suas patinhas! 💅👾"
  },
  {
    id: 22,
    icon: "🎨",
    tag: "Artes Galácticas",
    title: "Desenhar um Planeta",
    text: "Use lápis e papel para desenhar seu próprio planeta espacial hoje. Sua criatividade não tem limites no universo! 🎨🪐",
    girlText: "Use lápis e papel para desenhar seu próprio planeta espacial hoje. Sua criatividade não tem limites no universo! 🎨🪐",
    neutralText: "Use lápis e papel para desenhar seu próprio planeta espacial hoje. Sua criatividade não tem limites no universo! 🎨🪐"
  },
  {
    id: 23,
    icon: "⏰",
    tag: "Sono dos Justos",
    title: "Dormir na Hora Certa",
    text: "Deitar-se cedo hoje recarrega sua bateria biológica para um voo supersônico quando o sol nascer! ⏰💤",
    girlText: "Deitar-se cedo hoje recarrega sua bateria biológica para um voo supersônico quando o sol nascer! ⏰💤",
    neutralText: "Deitar-se cedo hoje recarrega sua bateria biológica para um voo supersônico quando o sol nascer! ⏰💤"
  },
  {
    id: 24,
    icon: "🍊",
    tag: "Suco da Vida",
    title: "Beber Suco Natural",
    text: "Beber um suco de laranja ou fruta feito na hora injeta milhões de nanocélulas de vitamina C no seu corpinho! 🍊⚡",
    girlText: "Beber um suco de laranja ou fruta feito na hora injeta milhões de nanocélulas de vitamina C no seu corpinho! 🍊⚡",
    neutralText: "Beber um suco de laranja ou fruta feito na hora injeta milhões de nanocélulas de vitamina C no seu corpinho! 🍊⚡"
  },
  {
    id: 25,
    icon: "🐶",
    tag: "Amigo dos Animais",
    title: "Ser Gentil com Pets",
    text: "Dar carinho a um bichinho de estimação ou respeitá-los espalha vibrações de paz por toda a fauna interplanetária! 🐶💖",
    girlText: "Dar carinho a um bichinho de estimação ou respeitá-los espalha vibrações de paz por toda a fauna interplanetária! 🐶💖",
    neutralText: "Dar carinho a um bichinho de estimação ou respeitá-los espalha vibrações de paz por toda a fauna interplanetária! 🐶💖"
  },
  {
    id: 26,
    icon: "🌟",
    tag: "Luz nos Outros",
    title: "Elogiar Alguém",
    text: "Diga a alguém da sua família um super elogio hoje (como 'Você cozinha muito bem!' ou 'Gosto do seu sorriso!'). Isso gera sorrisos estelares! 🌟💖",
    girlText: "Diga a alguém da sua família um super elogio hoje (como 'Você cozinha muito bem!' ou 'Gosto do seu sorriso!'). Isso gera sorrisos estelares! 🌟💖",
    neutralText: "Diga a alguém da sua família um super elogio hoje (como 'Você cozinha muito bem!' ou 'Gosto do seu sorriso!'). Isso gera sorrisos estelares! 🌟💖"
  },
  {
    id: 27,
    icon: "🥛",
    tag: "Escudo Ósseo",
    title: "Beber Leite ou Cálcio",
    text: "Fortalecer seus ossos hoje garante que você consiga dar saltos incríveis na lua e correr em alta velocidade! 🥛💪",
    girlText: "Fortalecer seus ossos hoje garante que você consiga dar saltos incríveis na lua e correr em alta velocidade! 🥛💪",
    neutralText: "Fortalecer seus ossos hoje garante que você consiga dar saltos incríveis na lua e correr em alta velocidade! 🥛💪"
  },
  {
    id: 28,
    icon: "🎲",
    tag: "Missão Analógica",
    title: "Brincar Offline",
    text: "Brincar com pecinhas, blocos de montar ou jogos de tabuleiro físicos exercita sua imaginação de engenheiro espacial! 🎲🛸",
    girlText: "Brincar com pecinhas, blocos de montar ou jogos de tabuleiro físicos exercita sua imaginação de engenheira espacial! 🎲🛸",
    neutralText: "Brincar com pecinhas, blocos de montar ou jogos de tabuleiro físicos exercita sua imaginação de astronauta espacial! 🎲🛸"
  },
  {
    id: 29,
    icon: "🧼",
    tag: "Higiene Facial",
    title: "Lavar o Rostinho",
    text: "Lavar o rosto com água fresquinha ao acordar remove a poeira cósmica dos seus olhos e afasta a preguiça galáctica! 🧼☀️",
    girlText: "Lavar o rosto com água fresquinha ao acordar remove a poeira cósmica dos seus olhos e afasta a preguiça galáctica! 🧼☀️",
    neutralText: "Lavar o rosto com água fresquinha ao acordar remove a poeira cósmica dos seus olhos e afasta a preguiça galáctica! 🧼☀️"
  },
  {
    id: 30,
    icon: "🎓",
    tag: "Grande Graduação",
    title: "Formatura de Herói",
    text: "Parabéns capitão! Você concluiu a jornada de 30 dias de missões estelares e se tornou oficialmente o Grão-Mestre Protetor do Universo! 🎓🏆🎉",
    girlText: "Parabéns capitã! Você concluiu a jornada de 30 dias de missões estelares e se tornou oficialmente a Grão-Mestra Protetora do Universo! 🎓🏆🎉",
    neutralText: "Parabéns astronauta! Você concluiu a jornada de 30 dias de missões estelares e se tornou oficialmente o Grão-Mestre Protetor do Universo! 🎓🏆🎉"
  }
];

// Synth Chime sound generator using browser AudioContext
const playStarSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Ascending Star Chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12); // C6
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
      osc2.frequency.exponentialRampToValueAtTime(2093.00, ctx.currentTime + 0.15); // E7
      gain2.gain.setValueAtTime(0.06, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.3);
    }, 85);
  } catch (e) {
    console.warn("Audio Synthesis failed.", e);
  }
};

export function KidsMascotGamerHUD({ childName = '', childGender = 'boy' }: KidsMascotGamerHUDProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentDayStreak, setCurrentDayStreak] = useState<number>(1);
  const [starsCount, setStarsCount] = useState<number>(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string>('');
  
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; emoji: string; drift: number; delay: number; duration: number; scale: number }[]>([]);

  // Load Star states & verify once-a-day popup triggers
  useEffect(() => {
    try {
      const savedStars = localStorage.getItem('kids_stars_count');
      const savedStreak = localStorage.getItem('kids_quest_streak_day');
      const savedDate = localStorage.getItem('kids_last_completed_quest_date');
      const dismissedThisSession = sessionStorage.getItem('kids_quest_dismissed_session');
      
      if (savedStars) setStarsCount(parseInt(savedStars));
      if (savedStreak) setCurrentDayStreak(parseInt(savedStreak));
      if (savedDate) setLastCompletedDate(savedDate);

      const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      
      // Auto popup once a day: If the kid has not completed today's quest and hasn't closed it in this tab session
      if (savedDate !== todayStr && dismissedThisSession !== 'true') {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("Failed loading stats from local storage.", e);
    }
  }, []);

  const handleDismissModal = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('kids_quest_dismissed_session', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const getAdviceText = (quest: Quest) => {
    const nameStr = childName ? ` ${childName}` : '';
    let baseText = childGender === 'girl' 
      ? quest.girlText 
      : childGender === 'neutral' 
      ? quest.neutralText 
      : quest.text;
    
    if (childName) {
      baseText = baseText.replace("astronauta,", `astronauta ${childName},`)
                         .replace("campeã,", `campeã ${childName},`);
    }
    return baseText;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = lastCompletedDate === todayStr;
  
  // Get active quest based on the streak day (1-30 mapped to 0-29 index)
  const activeQuestIndex = Math.min(29, Math.max(0, currentDayStreak - 1));
  const activeQuest = THIRTY_DAY_QUESTS[activeQuestIndex];

  // Complete Today's Mission!
  const handleCompleteQuest = () => {
    if (isCompletedToday) return;
    
    const nextStars = starsCount + 10;
    const nextDate = todayStr;
    // Streak increases. If it hits Day 30, it rolls back or resets to Day 1
    const nextStreak = currentDayStreak >= 30 ? 1 : currentDayStreak + 1;
    
    setStarsCount(nextStars);
    setLastCompletedDate(nextDate);
    setCurrentDayStreak(nextStreak);

    // Save to LocalStorage
    try {
      localStorage.setItem('kids_stars_count', nextStars.toString());
      localStorage.setItem('kids_last_completed_quest_date', nextDate);
      localStorage.setItem('kids_quest_streak_day', nextStreak.toString());
    } catch (e) {
      console.error(e);
    }

    // Trigger visual confetti and audio chime
    triggerCelebration();
  };

  const triggerCelebration = () => {
    playStarSound();

    const emojis = ['🌟', '✨', '🎉', '💖', '🚀', '⭐', '🎈'];
    const colors = ['#FBBF24', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'];
    const newConfetti = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 + 20, // percentage from left
      y: Math.random() * 30 + 40, // percentage from bottom
      color: colors[i % colors.length],
      emoji: emojis[i % emojis.length],
      drift: (Math.random() - 0.5) * 80,
      delay: Math.random() * 0.1,
      duration: Math.random() * 1.3 + 0.8,
      scale: Math.random() * 0.7 + 0.6
    }));

    setConfetti(newConfetti);
    
    // Clear particles
    setTimeout(() => {
      setConfetti([]);
    }, 2800);
  };

  return (
    <>
      {/* ── 🚀 COMPACT WIDGET BADGE LAUNCHER ON THE PAGE ── */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`relative w-full max-w-5xl mx-auto px-6 py-5 rounded-[24px] border backdrop-blur-md flex flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-300 group scale-100 hover:scale-[1.01] active:scale-98 select-none z-10 ${
          childGender === 'girl' 
            ? 'border-pink-500/25 bg-[#160b24]/60 hover:border-pink-500/40 shadow-md shadow-pink-950/10' 
            : 'border-white/10 bg-[#070514]/65 hover:border-violet-500/25 shadow-md shadow-indigo-950/15'
        }`}
      >
        <div className="flex items-center gap-4 text-left">
          {/* Animated Mascot Head Sphere */}
          <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${
            childGender === 'girl' ? 'bg-pink-500/10 border-pink-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
          }`}>
            <Image
              src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"}
              alt="Mascote"
              fill
              className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="size-3 text-yellow-400 animate-pulse" />
              Diário de Missões Estelares
            </span>
            <h3 className="text-xs sm:text-sm font-black text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Dia {activeQuest.id} da Aventura Saudável 🚀
            </h3>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-3">
          {isCompletedToday ? (
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1">
              <Check className="size-3 text-emerald-400" />
              Missão Concluída!
            </span>
          ) : (
            <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest bg-yellow-500/15 px-3 py-1.5 rounded-xl border border-yellow-500/20 flex items-center gap-1.5 animate-pulse">
              <span>Jogar Missão Diária</span>
              <span>🎮</span>
            </span>
          )}
          
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-yellow-300 text-[10px] font-black uppercase tracking-widest shadow-sm ${
            childGender === 'girl' ? 'bg-pink-500/10 border-pink-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
          }`}>
            <span>⭐ {starsCount}</span>
          </div>
        </div>
      </div>

      {/* ── 🛸 THE GORGEOUS 30-DAY DAILY SPACE ADVENTURE POPUP MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/85 transition-all select-none overflow-y-auto">
          {/* Confetti erupting layer inside the popup */}
          {confetti.map((c) => (
            <span
              key={c.id}
              className="fixed pointer-events-none select-none z-[60] animate-star-burst opacity-0 font-bold"
              style={{
                left: `${c.x}%`,
                bottom: `${c.y}%`,
                fontSize: `${32 * c.scale}px`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                ['--drift' as any]: `${c.drift}px`,
              }}
            >
              {c.emoji}
            </span>
          ))}

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes floatingMascot {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-14px) rotate(2deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
            .animate-mascot-float-modal {
              animation: floatingMascot 5s ease-in-out infinite;
            }
            @keyframes starBurst {
              0% { transform: translateY(0) scale(0.3) rotate(0deg); opacity: 0; }
              12% { opacity: 1; }
              85% { opacity: 0.85; }
              100% { transform: translateY(-240px) scale(1.3) translateX(var(--drift, 0px)) rotate(140deg); opacity: 0; }
            }
            .animate-star-burst {
              animation: starBurst 1.8s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
            }
            @keyframes modalEntrance {
              0% { transform: scale(0.92); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-modal-in {
              animation: modalEntrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}} />

          {/* Modal Container */}
          <div className={`relative max-w-2xl w-full border-2 rounded-[32px] p-6 sm:p-8 flex flex-col gap-6 text-left shadow-2xl animate-modal-in z-50 ${
            childGender === 'girl'
              ? 'bg-[#180922]/98 border-pink-500/35 shadow-pink-950/20'
              : 'bg-[#0a061c]/98 border-indigo-500/30 shadow-indigo-950/30'
          }`}
          style={{
            backgroundImage: childGender === 'girl'
              ? 'radial-gradient(circle at top left, rgba(236,72,153,0.14) 0%, transparent 60%)'
              : 'radial-gradient(circle at top left, rgba(99,102,241,0.12) 0%, transparent 60%)'
          }}
          >
            {/* Top Close Button */}
            <button 
              onClick={handleDismissModal}
              className={`absolute top-4 right-4 p-2 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                childGender === 'girl'
                  ? 'bg-pink-500/10 border-pink-500/20 text-pink-300 hover:bg-pink-500/20'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20'
              }`}
            >
              <X className="size-4" />
            </button>

            {/* Title / Streak Counter */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="size-3.5 text-yellow-400 animate-bounce" />
                Painel Diário de Missões Saudáveis
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Missão do Dia {activeQuest.id} 🛸
              </h2>
            </div>

            {/* Main content body: Mascot Wave + speech bubble */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
              {/* Mascot container with glowing rings */}
              <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <div className={`absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full blur-2xl opacity-60 animate-pulse transition-all duration-500 ${
                  childGender === 'girl' ? 'bg-pink-500/35' : 'bg-indigo-500/25'
                }`} />
                <Image
                  src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"}
                  alt="Mascote Gamer"
                  width={128}
                  height={128}
                  className={`object-contain animate-mascot-float-modal select-none ${
                    childGender === 'girl' 
                      ? 'drop-shadow-[0_12px_24px_rgba(244,63,94,0.6)]' 
                      : 'drop-shadow-[0_12px_24px_rgba(167,139,250,0.5)]'
                  }`}
                />
              </div>

              {/* Dynamic Speech bubble */}
              <div className={`relative flex-grow w-full rounded-2xl p-5 border text-left flex flex-col gap-3.5 ${
                childGender === 'girl'
                  ? 'bg-[#12071a]/95 border-pink-500/25'
                  : 'bg-[#05030f]/95 border-indigo-500/25'
              }`}>
                {/* Speech bubble pointer targeting mascot */}
                <div className={`absolute hidden sm:block -left-2.5 top-12 w-5 h-5 border-b border-l rotate-45 ${
                  childGender === 'girl' ? 'bg-[#12071a] border-pink-500/25' : 'bg-[#05030f] border-indigo-500/25'
                }`} />
                <div className={`absolute block sm:hidden -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 border-t border-l rotate-45 ${
                  childGender === 'girl' ? 'bg-[#12071a] border-pink-500/25' : 'bg-[#05030f] border-indigo-500/25'
                }`} />

                {/* Badge Tag */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm transition-all duration-300 ${
                    isCompletedToday
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-yellow-500/15 border border-yellow-500/20 text-yellow-300 scale-105 animate-pulse'
                  }`}>
                    <Sparkles className="size-3" />
                    {activeQuest.tag}
                  </span>

                  <span className={`text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1`}>
                    Dia {activeQuest.id} de 30 📅
                  </span>
                </div>

                {/* Advice Text Bubble */}
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white mb-1.5 flex items-center gap-1.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    <span>{activeQuest.icon}</span>
                    <span>{activeQuest.title}:</span>
                  </h4>
                  <p 
                    className="text-xs sm:text-sm font-bold text-white/90 leading-relaxed drop-shadow-md select-text"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    "{getAdviceText(activeQuest)}"
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Section: Progress indicator or Call-to-action button */}
            <div className="mt-2 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Stars & Progress feedback */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-yellow-300 text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  childGender === 'girl' ? 'bg-pink-500/10 border-pink-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                  <span>⭐ Estrelas: {starsCount}</span>
                </div>
                <span className="text-[10px] font-extrabold text-indigo-300">
                  Próxima recompensa em 10⭐
                </span>
              </div>

              {/* Dynamic Action Trigger */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                {isCompletedToday ? (
                  <button
                    onClick={handleDismissModal}
                    className={`w-full sm:w-auto py-3 px-6 rounded-xl text-indigo-300 hover:text-indigo-200 border border-white/5 hover:border-indigo-500/30 transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer`}
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Voltar aos Desenhos! 🚀
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDismissModal}
                      className="py-3 px-5 rounded-xl text-indigo-300/80 hover:text-indigo-200 font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      Depois 💤
                    </button>
                    <button
                      onClick={handleCompleteQuest}
                      className={`flex-grow sm:flex-grow-0 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-yellow-300 hover:to-yellow-400 text-indigo-950 font-black text-[9px] uppercase tracking-widest transition-all shadow-md shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-button-bloom`}
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      <Check className="size-3.5 stroke-[3px] text-indigo-950" />
                      MARCAR COMO CONCLUÍDO! ⭐ (+10 Estrelas)
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
