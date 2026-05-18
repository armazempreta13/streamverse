export type CursorThemeId = 'default' | 'spiderman' | 'ironman' | 'batman' | 'flash' | 'strange' | 'superman' | 'marvel' | 'dc' | 'anime';

export interface CursorRenderContext {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  hoverProgress: number; // 0 to 1
  velocity: { x: number; y: number; speed: number };
  time: number;
  isClicking: boolean;
}

export interface CursorTheme {
  id: CursorThemeId;
  name: string;
  dotColor: string;
  borderColor: string;
  customRender?: (context: CursorRenderContext) => void;
  hideNativeCursor?: boolean;
}

export const cursorThemes: Record<CursorThemeId, CursorTheme> = {
  default: {
    id: 'default',
    name: 'Padrão StreamVerse',
    dotColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    customRender: ({ ctx, hoverProgress, isClicking }) => {
      const radius = 6 + hoverProgress * 12;
      const dotRadius = isClicking ? 2 : 3 - hoverProgress * 1;

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + hoverProgress * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(0, 0, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  },

  spiderman: {
    id: 'spiderman',
    name: 'Homem-Aranha',
    dotColor: '#E50914',
    borderColor: 'rgba(229, 9, 20, 0.4)',
    customRender: ({ ctx, hoverProgress, velocity, time }) => {
      // Elasticity & organic deformation based on speed
      const stretchX = 1 + Math.min(velocity.speed * 0.05, 0.3);
      const stretchY = 1 - Math.min(velocity.speed * 0.03, 0.2);
      
      // Calculate travel angle to orient the stretch dynamically
      const angle = Math.atan2(velocity.y, velocity.x);
      
      ctx.save();
      if (velocity.speed > 0.5) {
        ctx.rotate(angle);
      }
      ctx.scale(stretchX, stretchY);

      const radius = 10 + hoverProgress * 6;

      // 1. Draw web structure in the background
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + hoverProgress * 0.25})`;
      ctx.lineWidth = 0.5;
      
      // Web spokes
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        ctx.stroke();
      }

      // Connecting web concentric circles
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Crimson Web Outer Ring
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#E50914';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Draw spider emblem symbol inside on hover
      if (hoverProgress > 0.05) {
        ctx.save();
        ctx.scale(hoverProgress, hoverProgress);
        ctx.fillStyle = '#ffffff';
        
        // Spider body
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spider head
        ctx.beginPath();
        ctx.arc(0, -3.5, 1, 0, Math.PI * 2);
        ctx.fill();

        // Elegant tiny web lines/legs
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.6;
        for (let leg = -1; leg <= 1; leg += 2) {
          ctx.beginPath();
          ctx.moveTo(leg * 1, -1);
          ctx.quadraticCurveTo(leg * 5, -3, leg * 6, -5);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(leg * 1.5, 0);
          ctx.quadraticCurveTo(leg * 6, 0, leg * 7, -1);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(leg * 1, 1);
          ctx.quadraticCurveTo(leg * 5, 3, leg * 5.5, 5);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // Simple elegant white center core
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
    }
  },

  ironman: {
    id: 'ironman',
    name: 'Homem de Ferro',
    dotColor: '#00F0FF',
    borderColor: 'rgba(0, 240, 255, 0.4)',
    customRender: ({ ctx, hoverProgress, time, isClicking }) => {
      const radius = 12 + hoverProgress * 8;
      
      // 1. ARC Reactor Glowing Core
      const glowGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, radius);
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      glowGrad.addColorStop(0.2, 'rgba(0, 240, 255, 0.8)');
      glowGrad.addColorStop(0.8, 'rgba(0, 240, 255, 0.15)');
      glowGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 2. Rotating segmented UI outer ring
      ctx.save();
      ctx.rotate(time * 0.001);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      
      // 3 Arc Reactor segments
      for (let i = 0; i < 3; i++) {
        const startAngle = (i * Math.PI * 2) / 3 + 0.1;
        const endAngle = ((i + 1) * Math.PI * 2) / 3 - 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 2, startAngle, endAngle);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Central targeting reticle on hover
      if (hoverProgress > 0.01) {
        ctx.save();
        ctx.scale(hoverProgress, hoverProgress);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 0.8;

        // Faint tech target crosshair
        ctx.beginPath();
        ctx.moveTo(-radius - 3, 0); ctx.lineTo(-radius + 1, 0);
        ctx.moveTo(radius - 1, 0); ctx.lineTo(radius + 3, 0);
        ctx.moveTo(0, -radius - 3); ctx.lineTo(0, -radius + 1);
        ctx.moveTo(0, radius - 1); ctx.lineTo(0, radius + 3);
        ctx.stroke();
        ctx.restore();
      }

      // Small cyan center core
      ctx.beginPath();
      ctx.arc(0, 0, isClicking ? 1.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  },

  batman: {
    id: 'batman',
    name: 'Batman',
    dotColor: '#1A1A1A',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    customRender: ({ ctx, hoverProgress }) => {
      const scale = 1 - hoverProgress * 0.15;
      
      ctx.save();
      ctx.scale(scale, scale);

      // Faint carbon-fiber style outer ring
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sleek matte black Batarang/Batwing silhouette
      ctx.fillStyle = '#111215';
      ctx.strokeStyle = '#2D3139';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1.5;

      ctx.beginPath();
      // Center top head dip
      ctx.moveTo(0, -3);
      // Left ear
      ctx.lineTo(-1.5, -5.5);
      ctx.lineTo(-2.5, -5.5);
      // Left wing top curve
      ctx.quadraticCurveTo(-7, -4, -13, -1);
      // Left wing tip
      ctx.lineTo(-14, -0.5);
      // Left wing bottom curve (swoop back)
      ctx.quadraticCurveTo(-7, 2, -2.5, 1.5);
      // Tail bottom tip
      ctx.lineTo(0, 5);
      // Right wing bottom curve
      ctx.lineTo(2.5, 1.5);
      ctx.quadraticCurveTo(7, 2, 14, -0.5);
      // Right wing tip
      ctx.lineTo(13, -1);
      // Right wing top curve
      ctx.quadraticCurveTo(7, -4, 2.5, -5.5);
      ctx.lineTo(1.5, -5.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  },

  flash: {
    id: 'flash',
    name: 'Flash',
    dotColor: '#FFCC00',
    borderColor: 'rgba(255, 204, 0, 0.4)',
    customRender: ({ ctx, hoverProgress, velocity }) => {
      // Velocity-based physical distortion (speed trail & scaling)
      const speedFactor = Math.min(velocity.speed * 0.06, 0.6);
      const angle = Math.atan2(velocity.y, velocity.x);

      ctx.save();
      if (velocity.speed > 0.2) {
        ctx.rotate(angle);
      }
      
      // Speed trail stretch
      ctx.scale(1 + speedFactor * 1.5, 1 - speedFactor * 0.4);

      // 1. Red speed halo ring
      ctx.beginPath();
      ctx.arc(0, 0, 10 + hoverProgress * 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#E50914';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Neon Golden Lightning Bolt Core
      ctx.shadowColor = 'rgba(255, 204, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#FFCC00';

      ctx.beginPath();
      ctx.moveTo(-1, -7.5);
      ctx.lineTo(3.5, -1.5);
      ctx.lineTo(0.5, -1);
      ctx.lineTo(2.5, 7.5);
      ctx.lineTo(-2.5, 1);
      ctx.lineTo(0, 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },

  strange: {
    id: 'strange',
    name: 'Doutor Estranho',
    dotColor: '#FF9900',
    borderColor: 'rgba(255, 153, 0, 0.3)',
    customRender: ({ ctx, hoverProgress, time }) => {
      const radius = 16 + hoverProgress * 8;

      ctx.save();
      
      // Magic shield glow
      ctx.shadowColor = 'rgba(255, 153, 0, 0.6)';
      ctx.shadowBlur = 6;

      // 1. Outer mystic circle rotating clockwise
      ctx.save();
      ctx.rotate(time * 0.0004);
      ctx.strokeStyle = 'rgba(255, 153, 0, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Tiny outer geometric dots
      ctx.fillStyle = '#FF9900';
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * radius, Math.sin(a) * radius, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Inner arcane squares rotating counter-clockwise
      ctx.save();
      ctx.rotate(-time * 0.0006);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.5)';
      ctx.lineWidth = 0.8;
      
      // Double concentric squares
      ctx.strokeRect(-radius * 0.65, -radius * 0.65, radius * 1.3, radius * 1.3);
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-radius * 0.65, -radius * 0.65, radius * 1.3, radius * 1.3);
      ctx.restore();
      ctx.restore();

      // 3. Central golden magic seal/dot
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    }
  },

  superman: {
    id: 'superman',
    name: 'Superman',
    dotColor: '#FFCC00',
    borderColor: 'rgba(229, 9, 20, 0.4)',
    customRender: ({ ctx, hoverProgress }) => {
      ctx.save();
      // Draw golden diamond house shield
      ctx.strokeStyle = '#FFCC00';
      ctx.lineWidth = 1.6;
      ctx.fillStyle = '#E50914';
      ctx.shadowColor = 'rgba(255, 204, 0, 0.5)';
      ctx.shadowBlur = 5;

      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(8, -4);
      ctx.lineTo(6, 4);
      ctx.lineTo(0, 9);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-8, -4);
      ctx.closePath();
      ctx.stroke();

      // On hover, fill the red shield and draw stylized S
      if (hoverProgress > 0.05) {
        ctx.save();
        ctx.scale(hoverProgress, hoverProgress);
        ctx.fill();

        // White/Gold "S"
        ctx.fillStyle = '#FFCC00';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 0, 0.5);
        ctx.restore();
      } else {
        // Red dot in the center
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#E50914';
        ctx.fill();
      }
      ctx.restore();
    }
  },

  marvel: {
    id: 'marvel',
    name: 'Marvel',
    dotColor: '#E50914',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    customRender: ({ ctx, hoverProgress, time }) => {
      const radius = 10 + hoverProgress * 5;
      
      // Marvel Red outer circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#E50914';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Faint inner rotating ring
      ctx.save();
      ctx.rotate(-time * 0.001);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (hoverProgress > 0.05) {
        ctx.save();
        ctx.scale(hoverProgress, hoverProgress);
        // Styled Avengers "A" in white
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 10px Montserrat, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', 0, 0.5);
        ctx.restore();
      } else {
        // White center core
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  },

  dc: {
    id: 'dc',
    name: 'DC Universe',
    dotColor: '#00A3FF',
    borderColor: 'rgba(0, 163, 255, 0.4)',
    customRender: ({ ctx, hoverProgress, time }) => {
      const radius = 11 + hoverProgress * 5;
      
      // DC Blue outer glowing ring
      ctx.shadowColor = 'rgba(0, 163, 255, 0.5)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#00A3FF';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Concentric inner ring
      ctx.save();
      ctx.rotate(time * 0.0005);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (hoverProgress > 0.05) {
        ctx.save();
        ctx.scale(hoverProgress, hoverProgress);
        
        // Draw stylized Justice League star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          ctx.lineTo(Math.cos(angle) * 4, Math.sin(angle) * 4);
          const innerAngle = angle + Math.PI / 5;
          ctx.lineTo(Math.cos(innerAngle) * 1.5, Math.sin(innerAngle) * 1.5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Cyan center core
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#00E0FF';
        ctx.fill();
      }
    }
  },

  anime: {
    id: 'anime',
    name: 'Anime & Otaku',
    dotColor: '#FF5500',
    borderColor: 'rgba(255, 85, 0, 0.4)',
    customRender: ({ ctx, hoverProgress, time }) => {
      const radius = 10 + hoverProgress * 4;
      
      // Sakura / Chakra Orange outer ring
      ctx.shadowColor = 'rgba(255, 85, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#FF5500';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Swirling energy particles around the border
      ctx.save();
      ctx.rotate(time * 0.002);
      ctx.fillStyle = '#FFAA00';
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Inner fire/spirit flame core
      ctx.beginPath();
      ctx.arc(0, 0, hoverProgress > 0.05 ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = hoverProgress > 0.05 ? '#FFAA00' : '#ffffff';
      ctx.fill();
    }
  }
};
