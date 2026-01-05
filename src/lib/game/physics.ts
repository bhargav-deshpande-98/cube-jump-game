import type { GameConfig, Platform } from './types'

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

// Easing functions
export function easeOutQuad(t: number): number {
  return t * (2 - t)
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// Get screen Y position for a row
export function getRowScreenY(row: number, config: GameConfig, cameraY: number): number {
  return 160 + row * config.rowSpacing - cameraY
}

// Generate platforms for a specific row (2-3 platforms per row)
export function generatePlatformsForRow(
  row: number,
  config: GameConfig,
  score: number
): Platform[] {
  const platforms: Platform[] = []
  
  // Determine number of platforms for this row (2-3)
  const minPlatforms = 2
  const maxPlatforms = 3
  const numPlatforms = minPlatforms + Math.floor(Math.random() * (maxPlatforms - minPlatforms + 1))
  
  // Speed increases with score
  const speedMultiplier = 1 + Math.min(score / 40, 1.2)
  const baseSpeed = config.baseSpeed * speedMultiplier
  
  // Alternate direction based on row
  const direction = row % 2 === 0 ? 1 : -1
  
  // Distribute platforms across the row with some spacing
  const sectionWidth = config.width / numPlatforms
  
  for (let i = 0; i < numPlatforms; i++) {
    // Platform width varies (smaller = harder, more points)
    const sizeRand = Math.random()
    let widthMultiplier = 1
    let bonusPoints = 0
    
    if (score > 15 && sizeRand > 0.9) {
      widthMultiplier = 0.6
      bonusPoints = 2
    } else if (score > 8 && sizeRand > 0.7) {
      widthMultiplier = 0.75
      bonusPoints = 1
    }
    
    // Special platforms with gems (less frequent)
    const isSpecial = Math.random() > 0.9
    
    // Position within section with randomness
    const sectionStart = i * sectionWidth
    const x = sectionStart + sectionWidth * 0.2 + Math.random() * sectionWidth * 0.6
    
    // Slightly vary speed per platform
    const speed = (baseSpeed + Math.random() * 15) * direction
    
    platforms.push({
      row,
      x,
      width: config.tileWidth * widthMultiplier,
      speed,
      direction,
      isSpecial,
      bonusPoints,
      hasGem: isSpecial,
      gemCollected: false,
    })
  }
  
  return platforms
}

// Generate initial platforms
export function generateInitialPlatforms(config: GameConfig): Platform[] {
  let platforms: Platform[] = []
  
  for (let row = 0; row < config.platformRows; row++) {
    platforms = platforms.concat(generatePlatformsForRow(row, config, 0))
  }
  
  // Make sure first row has a centered platform for starting
  const firstRowPlatforms = platforms.filter(p => p.row === 0)
  if (firstRowPlatforms.length > 0) {
    // Center one of them and slow it down
    firstRowPlatforms[0].x = config.width / 2
    firstRowPlatforms[0].speed = firstRowPlatforms[0].direction * config.baseSpeed * 0.3
    firstRowPlatforms[0].width = config.tileWidth * 1.2 // Slightly wider starting platform
  }
  
  return platforms
}

// Update platform position
export function updatePlatform(
  platform: Platform,
  config: GameConfig,
  deltaTime: number
): void {
  platform.x += platform.speed * (deltaTime / 1000)
  
  // Wrap around screen
  const margin = platform.width
  if (platform.x < -margin) {
    platform.x = config.width + margin
  } else if (platform.x > config.width + margin) {
    platform.x = -margin
  }
}

// Find platform at a given position and row
export function findPlatformAtPosition(
  x: number,
  row: number,
  platforms: Platform[],
  _config: GameConfig
): Platform | null {
  const rowPlatforms = platforms.filter(p => p.row === row)
  
  for (const platform of rowPlatforms) {
    const halfWidth = platform.width / 2
    if (x >= platform.x - halfWidth && x <= platform.x + halfWidth) {
      return platform
    }
  }
  
  return null
}
