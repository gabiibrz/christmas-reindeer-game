import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GRAVITY, JUMP_FORCE, JETPACK_FORCE, BASE_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT,
  PLATFORM_HEIGHT, PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH, PLATFORM_GAP_MIN, PLATFORM_GAP_MAX,
  PRESENT_SIZE, MAGNET_RADIUS, STAMINA_MAX, STAMINA_DRAIN, STAMINA_REGEN,
  PowerUpType, POWERUP_DURATION, MAX_SPEED, SPEED_INCREMENT,
  COAL_PENALTY_STAMINA, COAL_PENALTY_SCORE, COCOA_REFILL
} from '../constants';
import { GameStatus, Player, Platform, Collectible, Particle, ActivePowerUp } from '../types';
import { drawAurora, drawPlayer, drawPlatform, drawCollectible, drawParticles } from '../utils/drawUtils';
import { gameAudio } from '../utils/audio';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number, collected: number) => void;
  onScoreUpdate: (score: number) => void;
  onStaminaUpdate: (stamina: number) => void;
  setPowerUps: (ups: ActivePowerUp[]) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, onGameOver, onScoreUpdate, onStaminaUpdate, setPowerUps: setExternalPowerUps
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Game State Refs (using Refs for performance in game loop)
  const playerRef = useRef<Player>({ 
    x: 100, y: 300, vy: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, stamina: STAMINA_MAX, isGrounded: false 
  });
  const platformsRef = useRef<Platform[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<ActivePowerUp[]>([]);
  
  const scoreRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);
  const frameCountRef = useRef(0);
  const isPressingActionRef = useRef(false);

  // Resize handler
  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialization
  const initGame = useCallback(() => {
    playerRef.current = { x: 100, y: windowSize.h / 2, vy: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, stamina: STAMINA_MAX, isGrounded: false };
    platformsRef.current = [];
    collectiblesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    scoreRef.current = 0;
    speedRef.current = BASE_SPEED;
    frameCountRef.current = 0;
    
    // Initial platform
    platformsRef.current.push({
      id: 'start',
      x: 50,
      y: windowSize.h / 2 + 100,
      width: 400,
      height: PLATFORM_HEIGHT
    });
  }, [windowSize]);

  // Handle Game Start / Restart
  useEffect(() => {
    if (platformsRef.current.length === 0) {
        initGame();
    }
  }, [status, initGame]);

  // Handle music start on interaction
  const handleInteraction = useCallback(() => {
      isPressingActionRef.current = true;
      if (status === GameStatus.PLAYING) {
        gameAudio.startMusic();
        if (playerRef.current.isGrounded) gameAudio.playJump();
      }
  }, [status]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleInteraction();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        isPressingActionRef.current = false;
      }
    };
    const handleMouseDown = () => {
        handleInteraction();
    }
    const handleMouseUp = () => isPressingActionRef.current = false;
    const handleTouchStart = () => {
        handleInteraction();
    }
    const handleTouchEnd = () => isPressingActionRef.current = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleInteraction]);

  // Main Loop
  const animate = useCallback((time: number) => {
    if (status !== GameStatus.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // --- LOGIC UPDATE ---
    const player = playerRef.current;
    const platforms = platformsRef.current;
    const collectibles = collectiblesRef.current;
    const particles = particlesRef.current;
    const powerUps = powerUpsRef.current;

    frameCountRef.current++;

    // Safety check: ensure platforms exist
    if (platforms.length === 0) {
        platforms.push({
             id: 'safety-plat',
             x: 50,
             y: height / 2 + 100,
             width: 400,
             height: PLATFORM_HEIGHT
        });
    }

    // Remove expired powerups
    const now = Date.now();
    for (let i = powerUps.length - 1; i >= 0; i--) {
      if (powerUps[i].expiresAt < now) {
        powerUps.splice(i, 1);
      }
    }
    // Update external state for UI less frequently
    if (frameCountRef.current % 10 === 0) {
       setExternalPowerUps([...powerUps]);
    }

    const activeFloat = powerUps.some(p => p.type === PowerUpType.FLOAT);
    const activeSpeed = powerUps.some(p => p.type === PowerUpType.SPEED);
    const activeMagnet = powerUps.some(p => p.type === PowerUpType.MAGNET);
    const scoreMultiplier = powerUps.some(p => p.type === PowerUpType.SCORE_MULTIPLIER) ? 2 : 1;

    // Speed progression
    if (speedRef.current < MAX_SPEED) {
        speedRef.current += SPEED_INCREMENT;
    }
    const currentScrollSpeed = activeSpeed ? speedRef.current * 1.5 : speedRef.current;

    // Sparkle Trail
    if (frameCountRef.current % 3 === 0) {
       particles.push({
           x: player.x,
           y: player.y + player.height / 2 + (Math.random() - 0.5) * 10,
           vx: -2 - Math.random() * 2,
           vy: (Math.random() - 0.5) * 2,
           life: 1.0,
           color: activeFloat ? '#a855f7' : '#fbbf24', 
           size: Math.random() * 6 + 2
       });
    }

    // Player Movement
    if (isPressingActionRef.current) {
        if (player.stamina > 0 || activeFloat) {
            player.vy += JETPACK_FORCE;
            if (!activeFloat) player.stamina = Math.max(0, player.stamina - STAMINA_DRAIN);
            
            // Extra intense sparkles when flying
            for(let i=0; i<2; i++) {
                particles.push({
                    x: player.x + 5,
                    y: player.y + player.height / 2 + 10,
                    vx: -3 - Math.random() * 3,
                    vy: 1 + Math.random() * 2,
                    life: 0.8,
                    color: '#ffffff',
                    size: Math.random() * 4 + 1
                });
            }
        }
    } else {
        // Regen stamina when grounded
        if (player.isGrounded) {
             player.stamina = Math.min(STAMINA_MAX, player.stamina + STAMINA_REGEN);
        }
    }
    
    // Gravity
    const gravity = activeFloat ? GRAVITY * 0.4 : GRAVITY;
    player.vy += gravity;
    player.y += player.vy;

    // Cap velocity
    if (player.vy > 15) player.vy = 15;
    if (player.vy < -12) player.vy = -12;

    // Ceiling Collision
    if (player.y < 0) {
        player.y = 0;
        if (player.vy < 0) player.vy = 0;
    }

    // Platform Collision
    player.isGrounded = false;
    if (player.vy > 0) {
        for (const plat of platforms) {
            if (
                player.x + player.width > plat.x &&
                player.x < plat.x + plat.width &&
                player.y + player.height >= plat.y &&
                player.y + player.height <= plat.y + plat.height + 15 
            ) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.isGrounded = true;
            }
        }
    }

    // Scroll World
    platforms.forEach(p => p.x -= currentScrollSpeed);
    collectibles.forEach(c => c.x -= currentScrollSpeed);
    particles.forEach(p => {
        p.x -= currentScrollSpeed * 0.5;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
    });

    // Cleanup off-screen
    if (platforms.length > 0 && platforms[0].x + platforms[0].width < -100) platforms.shift();
    if (collectibles.length > 0 && collectibles[0].x < -50) collectibles.shift();
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Generate Platforms
    const lastPlatform = platforms[platforms.length - 1];
    if (width - (lastPlatform.x + lastPlatform.width) > 0) {
         if (width - (lastPlatform.x + lastPlatform.width) > Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN) + PLATFORM_GAP_MIN) {
             const newY = Math.min(Math.max(lastPlatform.y + (Math.random() - 0.5) * 300, 100), height - 100);
             const newW = Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH) + PLATFORM_MIN_WIDTH;
             
             const newPlat: Platform = {
                 id: `plat-${Date.now()}`,
                 x: width + 50,
                 y: newY,
                 width: newW,
                 height: PLATFORM_HEIGHT
             };
             platforms.push(newPlat);

             if (Math.random() > 0.3) {
                 const rand = Math.random();
                 let type: 'PRESENT' | 'POWERUP' | 'COAL' | 'COCOA' = 'PRESENT';
                 let pType: PowerUpType | undefined;
                 let color = '#ef4444'; 

                 // 10% PowerUp, 10% Coal, 10% Cocoa, 70% Present
                 if (rand < 0.10) {
                     type = 'POWERUP';
                 } else if (rand < 0.20) {
                     type = 'COAL';
                     color = '#1c1917';
                 } else if (rand < 0.30) {
                     type = 'COCOA';
                     color = '#dc2626';
                 } else {
                     type = 'PRESENT';
                 }

                 if (type === 'PRESENT') {
                     const colors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6'];
                     color = colors[Math.floor(Math.random() * colors.length)];
                 } else if (type === 'POWERUP') {
                     const r = Math.random();
                     if (r < 0.25) { pType = PowerUpType.MAGNET; color = '#f472b6'; }
                     else if (r < 0.5) { pType = PowerUpType.SPEED; color = '#60a5fa'; }
                     else if (r < 0.75) { pType = PowerUpType.FLOAT; color = '#a78bfa'; }
                     else { pType = PowerUpType.SCORE_MULTIPLIER; color = '#fbbf24'; }
                 }

                 collectibles.push({
                     id: `col-${Date.now()}`,
                     x: newPlat.x + Math.random() * (newW - 40),
                     y: newPlat.y - 50 - (Math.random() * 100),
                     type,
                     powerUpType: pType,
                     collected: false,
                     color
                 });
             }
         }
    }

    // Collectibles & Magnetism
    collectibles.forEach(c => {
        if (c.collected) return;
        
        // Magnet only works on GOOD items
        if (activeMagnet && c.x < width && c.type !== 'COAL') {
            const dx = (player.x + player.width/2) - c.x;
            const dy = (player.y + player.height/2) - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < MAGNET_RADIUS) {
                c.x += dx * 0.15;
                c.y += dy * 0.15;
            }
        }

        if (
            player.x < c.x + PRESENT_SIZE &&
            player.x + player.width > c.x &&
            player.y < c.y + PRESENT_SIZE &&
            player.y + player.height > c.y
        ) {
            c.collected = true;
            
            if (c.type === 'COAL') {
                // Punishment
                player.stamina = Math.max(0, player.stamina - COAL_PENALTY_STAMINA);
                scoreRef.current = Math.max(0, scoreRef.current - COAL_PENALTY_SCORE);
                gameAudio.playBad();
                // Explosion of soot
                for(let i=0; i<8; i++) {
                    particles.push({
                        x: c.x + 15, y: c.y + 15,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        life: 1.0,
                        color: '#44403c',
                        size: Math.random() * 5 + 3
                    });
                }

            } else if (c.type === 'COCOA') {
                // Refill
                player.stamina = Math.min(STAMINA_MAX, player.stamina + COCOA_REFILL);
                gameAudio.playCollect(); // Reuse good sound
                for(let i=0; i<8; i++) {
                    particles.push({
                        x: c.x + 15, y: c.y + 15,
                        vx: (Math.random() - 0.5) * 4,
                        vy: -Math.random() * 5, // steam goes up
                        life: 1.2,
                        color: '#ffffff',
                        size: Math.random() * 4 + 2
                    });
                }
            } else if (c.type === 'PRESENT') {
                scoreRef.current += 100 * scoreMultiplier;
                gameAudio.playCollect();
                for(let i=0; i<8; i++) {
                    particles.push({
                        x: c.x + 15, y: c.y + 15,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 1.5,
                        color: c.color,
                        size: Math.random() * 6 + 4
                    });
                }
            } else if (c.powerUpType) {
                powerUpsRef.current.push({
                    type: c.powerUpType,
                    expiresAt: Date.now() + POWERUP_DURATION
                });
                gameAudio.playPowerUp();
                scoreRef.current += 50 * scoreMultiplier;
            }
        }
    });

    scoreRef.current += (0.1 * currentScrollSpeed * scoreMultiplier);
    onScoreUpdate(Math.floor(scoreRef.current));
    onStaminaUpdate(player.stamina);

    if (player.y > height) {
        gameAudio.playGameOver();
        onGameOver(Math.floor(scoreRef.current), collectibles.filter(c => c.collected && c.type === 'PRESENT').length);
        return; 
    }

    drawAurora(ctx, width, height, frameCountRef.current);
    drawParticles(ctx, particles);
    platforms.forEach(p => drawPlatform(ctx, p));
    collectibles.filter(c => !c.collected).forEach(c => drawCollectible(ctx, c, frameCountRef.current));
    drawPlayer(ctx, player, frameCountRef.current, powerUps);

    requestRef.current = requestAnimationFrame(animate);
  }, [status, windowSize, onGameOver, onScoreUpdate, onStaminaUpdate, setExternalPowerUps, handleInteraction]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <canvas 
      ref={canvasRef}
      width={windowSize.w}
      height={windowSize.h}
      className="block touch-none"
    />
  );
};

export default GameCanvas;