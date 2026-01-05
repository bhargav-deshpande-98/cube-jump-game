// Game state types
export type GameState = 'idle' | 'playing' | 'gameover'

// Game configuration
export interface GameConfig {
  width: number
  height: number
  // Isometric settings
  tileWidth: number
  tileHeight: number
  tileDepth: number
  // Platform settings
  platformRows: number
  platformsPerRow: number
  rowSpacing: number
  // Player
  cubeSize: number
  jumpDuration: number
  jumpHeight: number
  // Speeds
  baseSpeed: number
  speedIncrement: number
  maxSpeed: number
}

// Platform
export interface Platform {
  row: number
  x: number
  width: number
  speed: number
  direction: number
  isSpecial: boolean
  bonusPoints: number
  hasGem: boolean
  gemCollected: boolean
}

// Player
export interface Player {
  x: number
  currentRow: number
  currentPlatform: Platform | null
  isJumping: boolean
  jumpProgress: number
  targetRow: number
  isFalling: boolean
  fallProgress: number
}

// Particle
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
}

// Complete game state
export interface GameData {
  state: GameState
  config: GameConfig
  platforms: Platform[]
  player: Player
  particles: Particle[]
  score: number
  highScore: number
  cameraY: number
  targetCameraY: number
}
