import type { GameConfig } from './types'

// Create game configuration based on screen size
export const createGameConfig = (width: number, height: number): GameConfig => {
  const scale = Math.min(width / 400, height / 700)
  
  return {
    width,
    height,
    // Isometric settings
    tileWidth: 60 * scale,
    tileHeight: 30 * scale,
    tileDepth: 15 * scale,
    // Platform settings
    platformRows: 15,
    platformsPerRow: 3, // 2-3 platforms per row
    rowSpacing: 50 * scale,
    // Player
    cubeSize: 22 * scale,
    jumpDuration: 250, // ms
    jumpHeight: 45 * scale,
    // Speeds (pixels per second)
    baseSpeed: 55 * scale,
    speedIncrement: 5 * scale,
    maxSpeed: 140 * scale,
  }
}

// Colors
export const COLORS = {
  // Background
  background: '#1a1a2e',
  backgroundGradient: '#16213e',
  
  // Platforms
  platformTop: '#4cc9f0',
  platformLeft: '#3a9fc4',
  platformRight: '#2d7a99',
  platformSpecial: '#f72585',
  platformSpecialLeft: '#c41d6a',
  platformSpecialRight: '#9c1755',
  
  // Player cube
  cubeTop: '#ffbe0b',
  cubeLeft: '#e6a800',
  cubeRight: '#cc9500',
  
  // Collectibles
  gemColor: '#00ff88',
  
  // UI
  text: '#ffffff',
  scoreText: '#ffbe0b',
}

// Sound configurations
export const SOUNDS = {
  jump: { frequency: 500, duration: 0.1, type: 'sine' as OscillatorType },
  land: { frequency: 300, duration: 0.15, type: 'sine' as OscillatorType },
  gem: { frequency: 800, duration: 0.1, type: 'sine' as OscillatorType },
  fall: { frequency: 300, duration: 0.15, type: 'sawtooth' as OscillatorType },
}
