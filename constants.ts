export const GRAVITY = 0.5;
export const JUMP_FORCE = -8;
export const JETPACK_FORCE = -0.9; 
export const BASE_SPEED = 5;
export const MAX_SPEED = 12;
export const SPEED_INCREMENT = 0.001;

// Increased size for Cuteness Factor
export const PLAYER_WIDTH = 80;
export const PLAYER_HEIGHT = 60; 

export const PLATFORM_HEIGHT = 20;
export const PLATFORM_MIN_WIDTH = 100;
export const PLATFORM_MAX_WIDTH = 300;
export const PLATFORM_GAP_MIN = 80;
export const PLATFORM_GAP_MAX = 200;

export const PRESENT_SIZE = 30;
export const MAGNET_RADIUS = 250;
export const STAMINA_MAX = 100;
export const STAMINA_DRAIN = 0.25; 
export const STAMINA_REGEN = 2.0; 

export const COCOA_REFILL = 40;
export const COAL_PENALTY_STAMINA = 30;
export const COAL_PENALTY_SCORE = 200;

export enum PowerUpType {
  MAGNET = 'MAGNET',
  SPEED = 'SPEED',
  FLOAT = 'FLOAT', 
  SCORE_MULTIPLIER = 'SCORE_MULTIPLIER'
}

export const POWERUP_DURATION = 5000; // ms