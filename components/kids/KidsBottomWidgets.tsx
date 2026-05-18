import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

interface KidsBottomWidgetsProps {
  childName?: string;
  childGender?: 'boy' | 'girl' | 'neutral';
}

export function KidsBottomWidgets({ childName = '', childGender = 'boy' }: KidsBottomWidgetsProps) {
  
  const FRASES = [
    childName 
      ? `Olá, ${childName}! Estou muito feliz em te ver por aqui! 🚀`
      : "Olá! Estou muito feliz em te ver por aqui! 🚀",
    "Você sabia que o StreamVerse Kids é monitorado por robôs do espaço? 🤖✨",
    childGender === 'girl'
      ? "Você é a melhor astronauta do universo inteirinho! 💫"
      : childGender === 'neutral'
        ? "Nosso foguete espacial está pronto para novas aventuras! 💫"
        : "Você é o melhor astronauta do universo inteirinho! 💫",
    "O espaço está cheio de jogos legais esperando por você! 👾",
    childGender === 'girl'
      ? "Lembre-se de fazer pausas para beber água, campeã espacial! 🥤🚀"
      : childGender === 'neutral'
        ? "Lembre-se de fazer pausas para beber água, astronauta! 🥤🚀"
        : "Lembre-se de fazer pausas para beber água, campeão espacial! 🥤🚀"
  ];

  const [activePhrase, setActivePhrase] = useState(
    childName 
      ? `Aqui é tudo feito com carinho para você se divertir seguro, ${childName}! 💜`
      : "Aqui é tudo feito com carinho para você se divertir seguro! 💜"
  );
  const [clicking, setClicking] = useState(false);



  const handleMascotClick = () => {
    if (clicking) return; // Prevent spamming animations
    setClicking(true);

    // Choose a random cool phrase from list
    const randomIndex = Math.floor(Math.random() * FRASES.length);
    setActivePhrase(FRASES[randomIndex]);

    // End animation state after animation duration
    setTimeout(() => {
      setClicking(false);
    }, 700);
  };

  const isGirl = childGender === 'girl';

  return (
    <div className="mt-16 w-full relative pb-24 md:pb-28 cloud-sea-wrapper overflow-visible">

      {/* ── DECORATIVE PARALLAX CLOUD SEA (DOUBLE LAYER LOOP) ── */}
      <div
        className="absolute left-[-20vw] right-[-20vw] pointer-events-none z-0 select-none -mx-6 md:-mx-12 lg:-mx-16"
        style={{
          bottom: 'var(--cloud-bottom)',
          height: 'var(--cloud-back-height)',
          backgroundImage: 'url(/kids/nuvem.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom center',
          backgroundSize: 'var(--cloud-back-size) auto',
          animation: 'cloud-scroll-slow var(--cloud-back-speed) linear infinite',
          opacity: 'var(--cloud-back-opacity)',
          filter: isGirl 
            ? 'drop-shadow(0 -5px 12px rgba(244,63,94,0.22)) sepia(0.18) hue-rotate(310deg) saturate(1.3) contrast(1.1) brightness(1.05) blur(var(--cloud-back-blur))'
            : 'blur(var(--cloud-back-blur))',
        }}
      />

      <div
        className="absolute left-[-20vw] right-[-20vw] pointer-events-none z-0 select-none -mx-6 md:-mx-12 lg:-mx-16"
        style={{
          bottom: 'var(--cloud-bottom)',
          height: 'var(--cloud-front-height)',
          backgroundImage: 'url(/kids/nuvem.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom center',
          backgroundSize: 'var(--cloud-front-size) auto',
          animation: 'cloud-scroll-fast var(--cloud-front-speed) linear infinite',
          opacity: 'var(--cloud-front-opacity)',
          filter: isGirl
            ? 'drop-shadow(0 -5px 10px rgba(244,63,94,0.25)) sepia(0.18) hue-rotate(310deg) saturate(1.3) contrast(1.1) brightness(1.05) blur(var(--cloud-front-blur))'
            : 'blur(var(--cloud-front-blur))',
        }}
      />



      {/* Mascot & Floating Action Button Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none z-[100] flex justify-between items-end overflow-visible select-none">

        {/* Mascot Floating Island Companion (Left) - MUCH MORE COMPACT */}
        <div
          onClick={handleMascotClick}
          className="flex items-center gap-3 bg-[#0F0A28]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 pr-4 shadow-xl pointer-events-auto group hover:border-indigo-500/30 hover:bg-[#150F37]/95 cursor-pointer transition-all duration-300 animate-island max-w-[12rem] sm:max-w-[16rem] relative z-10"
        >
          <style dangerouslySetInnerHTML={{
            __html: `
            /* ── DYNAMIC CONFIGURABLE CLOUD PARALLAX SEA ── */
            .cloud-sea-wrapper {
              --cloud-back-speed: 600;
              --cloud-back-size: 1600px;
              --cloud-back-opacity: 0.16;
              --cloud-back-blur: 3.2px;

              --cloud-front-speed: 800;
              --cloud-front-size: 2500px;
              --cloud-front-opacity: 0.28;
              --cloud-front-blur: 1.2px;

              --cloud-bottom: -35px;
              --cloud-back-height: 290px;
              --cloud-front-height: 230px;
            }

            @media (min-width: 768px) {
              .cloud-sea-wrapper {
                --cloud-bottom: -55px;
                --cloud-back-height: 390px;
                --cloud-front-height: 315px;
              }
            }

            @keyframes island-float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-6px) rotate(0.5deg); }
            }
            @keyframes mascot-wiggle-extreme {
              0%, 100% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(1.08) rotate(-6deg) translateY(-2px); }
              50% { transform: scale(1.12) rotate(6deg) translateY(-8px); }
              75% { transform: scale(1.08) rotate(-3deg) translateY(-2px); }
            }
            @keyframes mascot-click-jump {
              0% { transform: scale(1) translateY(0) rotate(0deg); }
              20% { transform: scale(1.25, 0.75) translateY(0) rotate(-6deg); }
              40% { transform: scale(0.9, 1.25) translateY(-20px) rotate(12deg); }
              60% { transform: scale(1.12, 0.9) translateY(-8px) rotate(-6deg); }
              80% { transform: scale(0.97, 1.03) translateY(-1px) rotate(3deg); }
              100% { transform: scale(1) translateY(0) rotate(0deg); }
            }
            @keyframes cloud-scroll-slow {
              from { background-position-x: 0px; }
              to { background-position-x: var(--cloud-back-size); }
            }
            @keyframes cloud-scroll-fast {
              from { background-position-x: 0px; }
              to { background-position-x: var(--cloud-front-size); }
            }
            .animate-island {
              animation: island-float 5s ease-in-out infinite;
            }
            .animate-mascot-companion {
              transform-origin: bottom center;
              transition: transform 0.5s ease-in-out;
            }
            .group:hover .animate-mascot-companion {
              animation: mascot-wiggle-extreme 0.8s ease-in-out infinite;
            }
            .animate-mascot-click {
              animation: mascot-click-jump 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
            }
          `}} />

          <div className="relative size-10 sm:size-14 md:size-16 flex items-center justify-center overflow-visible shrink-0">
            <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-500 ${
              childGender === 'girl' 
                ? 'bg-pink-500/20 group-hover:bg-pink-400/30' 
                : 'bg-indigo-500/10 group-hover:bg-indigo-400/20'
            }`} />
            <Image
              src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"}
              alt="Mascote StreamVerse Kids"
              fill
              className={`object-contain animate-mascot-companion ${
                childGender === 'girl'
                  ? 'drop-shadow-[0_8px_15px_rgba(244,63,94,0.6)]'
                  : 'drop-shadow-[0_8px_15px_rgba(99,102,241,0.55)]'
              } ${clicking ? 'animate-mascot-click' : ''}`}
            />
          </div>

          <div className="border-l border-white/15 pl-3 transition-all duration-300">
            <p className="text-white text-[10px] sm:text-xs font-black leading-snug drop-shadow-sm text-indigo-100" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {activePhrase}
            </p>
          </div>
        </div>

        {/* Floating Gamepad Button (Right) - COMPACT AND GLOWING */}
        <Link href="/kids/play" className="pointer-events-auto relative z-10 block">
          <button className="relative size-12 sm:size-14 md:size-16 rounded-full bg-gradient-to-r from-[#FFE775] to-[#FFD100] border border-[#FFE775]/25 text-indigo-950 shadow-lg shadow-[#FFD100]/25 hover:shadow-[#FFD100]/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group animate-button-bloom">
            <Gamepad2 className="size-6 sm:size-8 text-indigo-955 group-hover:rotate-12 transition-transform duration-500" />

            {/* Confetti decoration around gamepad */}
            <div className="absolute -top-3 -left-3 w-2 h-2 bg-pink-400 rounded-sm rotate-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-3 transition-all duration-300" />
            <div className="absolute top-0 -right-4 w-2 h-2 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-500 delay-75" />
            <div className="absolute -bottom-2 -left-4 w-2.5 h-2.5 bg-emerald-400 rounded-sm rotate-45 opacity-0 group-hover:opacity-100 group-hover:-translate-x-3 transition-all duration-300 delay-150" />
          </button>
        </Link>

      </div>

    </div>
  );
}
