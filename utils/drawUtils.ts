import { Player, Platform, Collectible, Particle, ActivePowerUp } from '../types';
import { PowerUpType, MAGNET_RADIUS } from '../constants';

export const drawAurora = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
  // Dynamic Background color cycling
  // Cycle slowly between deep blues, purples, and teals
  // Hues: 220 (Blue) -> 260 (Purple) -> 280 (Violet) -> 200 (Teal)
  const cycleSpeed = 0.003;
  const baseHue = 230 + Math.sin(time * cycleSpeed) * 50; 
  
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  // Top color: Darker, saturated
  bgGradient.addColorStop(0, `hsl(${baseHue}, 60%, 8%)`); 
  // Bottom color: Slightly lighter, more vibrant
  bgGradient.addColorStop(1, `hsl(${baseHue + 20}, 50%, 15%)`);
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Aurora layers with shifting colors
  // We use the baseHue but offset it to create complementary or analogous harmonies
  const layerConfigs = [
    { offset: 0, opacity: 0.2, speed: 0.002, heightMod: 100 },
    { offset: 30, opacity: 0.2, speed: 0.003, heightMod: 60 },
    { offset: -30, opacity: 0.15, speed: 0.001, heightMod: 140 }
  ];
  
  layerConfigs.forEach((conf, index) => {
    ctx.beginPath();
    // Calculate a dynamic color for this layer
    const layerHue = (baseHue + 120 + conf.offset + Math.sin(time * 0.01) * 20) % 360;
    ctx.fillStyle = `hsla(${layerHue}, 70%, 60%, ${conf.opacity})`;
    
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 20) {
      // Create a waving curve using sine waves
      const wave = Math.sin(x * 0.005 + time * conf.speed + index) * conf.heightMod;
      const wave2 = Math.sin(x * 0.01 + time * 0.001) * 50;
      const y = (height / 2.5) + wave + wave2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
  });

  // Stars
  for(let i=0; i<80; i++) {
     const starX = (i * 137 + time * 0.2) % width;
     const starY = (i * 93) % (height * 0.8);
     const twinkle = Math.sin(time * 0.05 + i) * 0.5 + 0.5;
     
     // Stars occasionally tint slightly to match the aurora
     const starHue = baseHue + (i % 60);
     ctx.fillStyle = `hsla(${starHue}, 20%, 90%, ${twinkle})`;
     
     ctx.beginPath();
     ctx.arc(starX, starY, Math.random() > 0.8 ? 1.5 : 1, 0, Math.PI * 2);
     ctx.fill();
  }
};

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | number[]) => {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(x, y, width, height, radius);
    } else {
        ctx.rect(x, y, width, height);
    }
    ctx.closePath();
};

export const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, time: number, powerUps: ActivePowerUp[]) => {
  const { x, y, width, height } = player;
  const hasMagnet = powerUps.some(p => p.type === PowerUpType.MAGNET);
  const hasFloat = powerUps.some(p => p.type === PowerUpType.FLOAT);

  // Magnet Field
  if (hasMagnet) {
      ctx.beginPath();
      ctx.arc(x + width/2, y + height/2, MAGNET_RADIUS / 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(248, 113, 113, ${0.2 + Math.sin(time * 0.1) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
  }

  // Float visual (Wing glow)
  if (hasFloat) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#a855f7';
  }

  // --- SUPER CUTE "SANRIO-STYLE" REINDEER ---
  ctx.save();
  ctx.translate(x + width/2, y + height/2);
  
  // Gentle tilt
  const rotation = Math.min(Math.max(player.vy * 0.05, -0.3), 0.3);
  ctx.rotate(rotation);
  
  const bob = Math.sin(time * 0.15) * 3;
  const legCycle = time * 0.4;

  // Colors
  const skinColor = '#C19A6B'; // Warm tan/light brown (cookie color)
  const darkSkinColor = '#8D6E63';
  const scarfColor = '#EF4444';

  // 1. Scarf (Back part - drawn first to be behind)
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = scarfColor;
  ctx.beginPath();
  ctx.moveTo(-10, 10 + bob);
  // Flowing tail
  const wave = Math.sin(time * 0.2) * 10;
  ctx.quadraticCurveTo(-30, 15 + bob + wave, -45, 5 + bob + wave);
  ctx.stroke();

  // 2. Legs (Tiny rounded nubs)
  ctx.fillStyle = darkSkinColor;
  // Back Legs
  const legOffset = Math.sin(legCycle) * 4;
  ctx.beginPath();
  ctx.arc(-12 - legOffset, 22 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8 - legOffset, 22 + bob, 5, 0, Math.PI * 2);
  ctx.fill();

  // 3. Body (Small rounded potato)
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  // x, y, radiusX, radiusY, rotation, start, end
  ctx.ellipse(0, 12 + bob, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // White Belly Spot
  ctx.fillStyle = '#FFF3E0';
  ctx.beginPath();
  ctx.arc(0, 15 + bob, 8, 0, Math.PI * 2);
  ctx.fill();

  // Front Legs (Drawn over body)
  ctx.fillStyle = skinColor;
  const legOffset2 = Math.cos(legCycle) * 4;
  ctx.beginPath();
  ctx.arc(-12 + legOffset2, 22 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8 + legOffset2, 22 + bob, 5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Scarf (Front collar)
  ctx.strokeStyle = scarfColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-12, 5 + bob);
  ctx.quadraticCurveTo(0, 10 + bob, 12, 5 + bob);
  ctx.stroke();

  // 5. Head (Large, spherical, cute)
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, -10 + bob, 22, 0, Math.PI * 2);
  ctx.fill();

  // 6. Ears (Droopy but perky)
  ctx.fillStyle = skinColor;
  // Left
  ctx.beginPath();
  ctx.ellipse(-20, -12 + bob, 8, 4, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Right
  ctx.beginPath();
  ctx.ellipse(20, -12 + bob, 8, 4, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Antlers (Tiny, rounded, non-threatening)
  ctx.strokeStyle = '#FFE082'; // Gold/Cream
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Left
  ctx.moveTo(-8, -25 + bob);
  ctx.quadraticCurveTo(-12, -35 + bob, -5, -38 + bob);
  ctx.moveTo(-10, -32 + bob);
  ctx.lineTo(-15, -34 + bob);
  // Right
  ctx.moveTo(8, -25 + bob);
  ctx.quadraticCurveTo(12, -35 + bob, 5, -38 + bob);
  ctx.moveTo(10, -32 + bob);
  ctx.lineTo(15, -34 + bob);
  ctx.stroke();

  // 8. Face Features
  // Muzzle (Just a lighter patch)
  ctx.fillStyle = '#FFF3E0';
  ctx.beginPath();
  ctx.ellipse(0, -4 + bob, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose (Red, shiny, round)
  ctx.fillStyle = '#FF5252';
  ctx.shadowColor = '#FF5252';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, -5 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Nose Shine
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(2, -7 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (Wide set, black dots)
  ctx.fillStyle = '#2D1B0E';
  // Left
  ctx.beginPath();
  ctx.arc(-12, -10 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  // Right
  ctx.beginPath();
  ctx.arc(12, -10 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Blush
  ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
  ctx.beginPath();
  ctx.arc(-16, -5 + bob, 4, 0, Math.PI * 2);
  ctx.arc(16, -5 + bob, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const drawPlatform = (ctx: CanvasRenderingContext2D, platform: Platform) => {
  // Snow layer top
  ctx.fillStyle = '#f8fafc'; // Slate-50
  drawRoundedRect(ctx, platform.x, platform.y, platform.width, platform.height, 5);
  ctx.fill();

  // Icy bottom with gradient
  const grad = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  
  // Custom rounded bottom rect
  drawRoundedRect(ctx, platform.x, platform.y + 12, platform.width, platform.height - 12, [0, 0, 5, 5]);
  ctx.fill();
  
  // Snow texture details
  ctx.fillStyle = '#ffffff';
  for(let i=0; i<platform.width; i+=20) {
      if(Math.random() > 0.5) ctx.fillRect(platform.x + i, platform.y + 2, 4, 2);
  }
};

export const drawCollectible = (ctx: CanvasRenderingContext2D, item: Collectible, time: number) => {
  const bounce = Math.sin(time * 0.08) * 6;
  const { x, y, color } = item;
  
  ctx.save();
  ctx.translate(x, y + bounce);

  if (item.type === 'PRESENT') {
      // Box
      ctx.fillStyle = color;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 5;
      ctx.fillRect(0, 0, 30, 30);
      ctx.shadowBlur = 0;
      
      // Ribbon vertical
      ctx.fillStyle = '#fef3c7'; // Gold
      ctx.fillRect(12, 0, 6, 30);
      
      // Ribbon horizontal
      ctx.fillRect(0, 12, 30, 6);
      
      // Bow
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(15, 6, 6, 0, Math.PI * 2);
      ctx.fill();
      
  } else if (item.type === 'COAL') {
      // Lump of Coal
      ctx.fillStyle = '#1c1917'; // stone-900
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(10, 5);
      ctx.lineTo(25, 2);
      ctx.lineTo(30, 15);
      ctx.lineTo(20, 28);
      ctx.lineTo(5, 20);
      ctx.lineTo(2, 10);
      ctx.fill();
      
      // jagged highlight
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.lineTo(20, 12);
      ctx.lineTo(15, 18);
      ctx.fill();
      ctx.shadowBlur = 0;

  } else if (item.type === 'COCOA') {
      // Mug
      ctx.fillStyle = '#dc2626'; // Red Mug
      ctx.beginPath();
      ctx.fillRect(5, 10, 20, 20);
      
      // Handle
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(25, 20, 6, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      
      // Liquid
      ctx.fillStyle = '#78350f'; // Brown
      ctx.fillRect(7, 12, 16, 4);

      // Steam particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const steamY = Math.sin(time * 0.1) * 5;
      ctx.beginPath();
      ctx.arc(10, 5 + steamY, 2, 0, Math.PI * 2);
      ctx.arc(18, 2 - steamY, 2, 0, Math.PI * 2);
      ctx.fill();

  } else {
     // Powerup Orb
     ctx.shadowColor = color;
     ctx.shadowBlur = 10;
     ctx.fillStyle = color;
     ctx.beginPath();
     ctx.arc(15, 15, 15, 0, Math.PI * 2);
     ctx.fill();
     ctx.shadowBlur = 0;
     
     ctx.strokeStyle = 'white';
     ctx.lineWidth = 2;
     ctx.beginPath();
     ctx.arc(15, 15, 12, 0, Math.PI * 2);
     ctx.stroke();

     // Icon text
     ctx.fillStyle = 'white';
     ctx.font = '900 16px Nunito';
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     let icon = '?';
     if (item.powerUpType === PowerUpType.MAGNET) icon = 'M';
     if (item.powerUpType === PowerUpType.SPEED) icon = '>>';
     if (item.powerUpType === PowerUpType.FLOAT) icon = '☁';
     ctx.fillText(icon, 15, 16);
  }

  ctx.restore();
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  particles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.life;
    
    // Draw Star or Sparkle
    ctx.fillStyle = p.color;
    ctx.beginPath();
    
    // Simple 4-point star for sparkles
    const size = p.size;
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.2, -size * 0.2, size, 0);
    ctx.quadraticCurveTo(size * 0.2, size * 0.2, 0, size);
    ctx.quadraticCurveTo(-size * 0.2, size * 0.2, -size, 0);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.2, 0, -size);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.restore();
  });
};