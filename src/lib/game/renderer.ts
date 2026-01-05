import type { GameData, GameConfig, Platform, Particle } from './types'
import { COLORS } from './constants'
import { lerp, easeOutQuad, getRowScreenY } from './physics'

// Draw background with gradient and grid
export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, COLORS.background)
  gradient.addColorStop(1, COLORS.backgroundGradient)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // Subtle diagonal grid for depth
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'
  ctx.lineWidth = 1
  for (let i = -10; i < 30; i++) {
    const y = i * 50
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y + width * 0.5)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(width, y)
    ctx.lineTo(0, y + width * 0.5)
    ctx.stroke()
  }
}

// Draw isometric block
export function drawIsometricBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  colors: { top: string; left: string; right: string }
) {
  const halfWidth = width / 2
  const halfDepth = depth / 2
  
  // Top face
  ctx.fillStyle = colors.top
  ctx.beginPath()
  ctx.moveTo(x, y - height)
  ctx.lineTo(x + halfWidth, y - height + halfDepth)
  ctx.lineTo(x, y - height + depth)
  ctx.lineTo(x - halfWidth, y - height + halfDepth)
  ctx.closePath()
  ctx.fill()
  
  // Left face
  ctx.fillStyle = colors.left
  ctx.beginPath()
  ctx.moveTo(x - halfWidth, y - height + halfDepth)
  ctx.lineTo(x, y - height + depth)
  ctx.lineTo(x, y + depth)
  ctx.lineTo(x - halfWidth, y + halfDepth)
  ctx.closePath()
  ctx.fill()
  
  // Right face
  ctx.fillStyle = colors.right
  ctx.beginPath()
  ctx.moveTo(x + halfWidth, y - height + halfDepth)
  ctx.lineTo(x, y - height + depth)
  ctx.lineTo(x, y + depth)
  ctx.lineTo(x + halfWidth, y + halfDepth)
  ctx.closePath()
  ctx.fill()
}

// Draw a platform
export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
  config: GameConfig,
  cameraY: number
) {
  const screenY = getRowScreenY(platform.row, config, cameraY)
  
  // Skip if off screen
  if (screenY < -100 || screenY > config.height + 100) return
  
  const colors = platform.isSpecial
    ? {
        top: COLORS.platformSpecial,
        left: COLORS.platformSpecialLeft,
        right: COLORS.platformSpecialRight,
      }
    : {
        top: COLORS.platformTop,
        left: COLORS.platformLeft,
        right: COLORS.platformRight,
      }
  
  drawIsometricBlock(
    ctx,
    platform.x,
    screenY,
    platform.width,
    config.tileHeight,
    config.tileDepth,
    colors
  )
  
  // Draw gem if present
  if (platform.hasGem && !platform.gemCollected) {
    const gemY = screenY - config.tileDepth - 20
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.15
    
    ctx.fillStyle = COLORS.gemColor
    ctx.shadowColor = COLORS.gemColor
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(platform.x, gemY, 7 * pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

// Draw the player cube
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: GameData['player'],
  config: GameConfig,
  cameraY: number
) {
  const size = config.cubeSize
  
  let screenX = player.x
  let screenY = getRowScreenY(player.currentRow, config, cameraY)
  let verticalOffset = 0
  let squash = 1
  
  // Jump animation
  if (player.isJumping) {
    const progress = player.jumpProgress
    
    // Player jumps straight forward (same X position)
    screenX = player.x
    
    // Vertical position interpolation between rows
    const startY = getRowScreenY(player.currentRow, config, cameraY)
    const endY = getRowScreenY(player.targetRow, config, cameraY)
    screenY = lerp(startY, endY, easeOutQuad(progress))
    
    // Arc jump height
    const jumpArc = Math.sin(progress * Math.PI)
    verticalOffset = jumpArc * config.jumpHeight
    
    // Squash and stretch
    if (progress < 0.15) {
      squash = 1 - progress * 2
    } else if (progress > 0.85) {
      squash = 1 - (1 - progress) * 2
    } else {
      squash = 1 + jumpArc * 0.2
    }
  }
  
  // Position player on top of platform
  const playerY = screenY - config.tileDepth - verticalOffset
  const height = size * squash
  
  // Shadow
  const shadowY = screenY - config.tileDepth + config.tileHeight * 0.3
  const shadowScale = player.isJumping ? 0.4 + (1 - Math.sin(player.jumpProgress * Math.PI)) * 0.4 : 0.8
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(screenX, shadowY, size * 0.35 * shadowScale, size * 0.18 * shadowScale, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw cube
  const cubeColors = {
    top: COLORS.cubeTop,
    left: COLORS.cubeLeft,
    right: COLORS.cubeRight,
  }
  
  drawIsometricBlock(ctx, screenX, playerY, size, size * 0.5, height, cubeColors)
  
  // Eyes
  ctx.fillStyle = '#000'
  const eyeY = playerY - height + size * 0.3
  ctx.beginPath()
  ctx.arc(screenX - 3, eyeY, 2, 0, Math.PI * 2)
  ctx.arc(screenX + 3, eyeY, 2, 0, Math.PI * 2)
  ctx.fill()
}

// Draw particles
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(p => {
    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

// Draw UI elements
export function drawUI(
  ctx: CanvasRenderingContext2D,
  score: number,
  highScore: number,
  state: GameData['state'],
  config: GameConfig
) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Score with shadow
  ctx.font = `bold ${Math.min(config.width * 0.15, 60)}px Arial`
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillText(score.toString(), config.width / 2 + 2, 70 + 2)
  ctx.fillStyle = COLORS.scoreText
  ctx.fillText(score.toString(), config.width / 2, 70)
  
  // High score
  if (highScore > 0) {
    ctx.font = `bold ${Math.min(config.width * 0.04, 16)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(`BEST: ${highScore}`, config.width / 2, 110)
  }
  
  // State messages
  if (state === 'idle') {
    ctx.font = `bold ${Math.min(config.width * 0.05, 20)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('TAP TO JUMP', config.width / 2, config.height - 80)
  } else if (state === 'gameover') {
    // Darken overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, config.width, config.height)
    
    ctx.font = `bold ${Math.min(config.width * 0.1, 40)}px Arial`
    ctx.fillStyle = '#ff4757'
    ctx.fillText('GAME OVER', config.width / 2, config.height / 2 - 20)
    
    ctx.font = `bold ${Math.min(config.width * 0.06, 24)}px Arial`
    ctx.fillStyle = COLORS.scoreText
    ctx.fillText(`SCORE: ${score}`, config.width / 2, config.height / 2 + 30)
    
    ctx.font = `bold ${Math.min(config.width * 0.045, 18)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('TAP TO RESTART', config.width / 2, config.height / 2 + 80)
  }
}

// Main render function
export function renderGame(ctx: CanvasRenderingContext2D, game: GameData) {
  const { config, state, player, platforms, particles, score, highScore, cameraY } = game
  
  // Clear and draw background
  ctx.clearRect(0, 0, config.width, config.height)
  drawBackground(ctx, config.width, config.height)
  
  // Draw platforms (sorted by row for proper layering)
  const sortedPlatforms = [...platforms].sort((a, b) => a.row - b.row)
  sortedPlatforms.forEach(p => drawPlatform(ctx, p, config, cameraY))
  
  // Draw player (if not completely fallen)
  if (state !== 'gameover' || player.fallProgress < 1) {
    drawPlayer(ctx, player, config, cameraY)
  }
  
  // Draw particles
  drawParticles(ctx, particles)
  
  // Draw UI
  drawUI(ctx, score, highScore, state, config)
}
