import { PowerUpType } from './constants';

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Player {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  stamina: number;
  isGrounded: boolean;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'PRESENT' | 'POWERUP' | 'COAL' | 'COCOA';
  powerUpType?: PowerUpType;
  collected: boolean;
  color: string;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
}