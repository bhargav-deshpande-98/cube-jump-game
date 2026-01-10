import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type GameData,
  createGameConfig,
  generateInitialPlatforms,
  generatePlatformsForRow,
  updatePlatform,
  findPlatformAtPosition,
  getRowScreenY,
  lerp,
  updateParticles,
  createJumpParticles,
  createFallParticles,
  createGemParticles,
  renderGame,
  playJumpSound,
  playLandSound,
  playGemSound,
  playFallSound,
  initAudio,
} from '@/lib/game'

// Flutter Bridge type definition
declare global {
  interface Window {
    FlutterBridge?: {
      postMessage: (message: string) => void
    }
  }
}

const STORAGE_KEY = 'cube-jump-highscore'

function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem(STORAGE_KEY, score.toString())
  } catch {
    // Storage not available
  }
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 360, height: 640 })
  const gameRef = useRef<GameData | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  
  // Initialize game state
  const initGame = useCallback((width: number, height: number): GameData => {
    const config = createGameConfig(width, height)
    const platforms = generateInitialPlatforms(config)
    
    // Find starting platform (the centered one in row 0)
    const startPlatform = platforms.find(p => p.row === 0 && p.x === config.width / 2)
    const startX = startPlatform ? startPlatform.x : config.width / 2
    
    return {
      state: 'idle',
      config,
      platforms,
      player: {
        x: startX,
        currentRow: 0,
        currentPlatform: startPlatform || null,
        isJumping: false,
        jumpProgress: 0,
        targetRow: 0,
        isFalling: false,
        fallProgress: 0,
      },
      particles: [],
      score: 0,
      highScore: loadHighScore(),
      cameraY: 0,
      targetCameraY: 0,
    }
  }, [])
  
  // Handle tap/click
  const handleTap = useCallback(() => {
    if (!gameRef.current) return
    const game = gameRef.current
    
    initAudio()
    
    if (game.state === 'idle') {
      game.state = 'playing'
      // Start first jump
      const { player, config, cameraY } = game
      
      player.isJumping = true
      player.jumpProgress = 0
      player.targetRow = player.currentRow + 1
      
      const screenY = getRowScreenY(player.currentRow, config, cameraY)
      game.particles = [
        ...game.particles,
        ...createJumpParticles(player.x, screenY - config.tileDepth),
      ]
      playJumpSound()
      return
    }
    
    if (game.state === 'gameover') {
      const { width, height } = game.config
      gameRef.current = initGame(width, height)
      return
    }
    
    if (game.state === 'playing' && !game.player.isJumping && !game.player.isFalling) {
      const { player, config, cameraY } = game
      
      // Jump straight forward (keep same X position)
      player.isJumping = true
      player.jumpProgress = 0
      player.targetRow = player.currentRow + 1
      
      const screenY = getRowScreenY(player.currentRow, config, cameraY)
      game.particles = [
        ...game.particles,
        ...createJumpParticles(player.x, screenY - config.tileDepth),
      ]
      playJumpSound()
    }
  }, [initGame])
  
  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    // Calculate delta time
    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16.67
    lastTimeRef.current = timestamp

    const game = gameRef.current
    const { config, player, platforms } = game
    
    if (game.state === 'playing' || game.state === 'idle') {
      // Update all platform positions
      platforms.forEach(platform => updatePlatform(platform, config, deltaTime))
      
      // Player moves with their current platform when not jumping
      if (!player.isJumping && !player.isFalling && player.currentPlatform) {
        player.x = player.currentPlatform.x
        
        // Check if player went off screen with platform
        if (player.x < -config.cubeSize * 2 || player.x > config.width + config.cubeSize * 2) {
          player.isFalling = true
          player.fallProgress = 0
          player.currentPlatform = null
          const screenY = getRowScreenY(player.currentRow, config, game.cameraY)
          game.particles = [...game.particles, ...createFallParticles(player.x, screenY)]
          playFallSound()
        }
      }
      
      // Update player jump
      if (player.isJumping) {
        player.jumpProgress += deltaTime / config.jumpDuration
        
        if (player.jumpProgress >= 1) {
          player.jumpProgress = 1
          player.isJumping = false
          
          // Check if landed on ANY platform in the target row
          const landedPlatform = findPlatformAtPosition(player.x, player.targetRow, platforms, config)
          
          if (landedPlatform) {
            // Successfully landed!
            player.currentRow = player.targetRow
            player.currentPlatform = landedPlatform
            player.x = landedPlatform.x // Snap to platform center
            
            // Score
            game.score += 1 + landedPlatform.bonusPoints
            
            // Collect gem
            if (landedPlatform.hasGem && !landedPlatform.gemCollected) {
              landedPlatform.gemCollected = true
              game.score += 3
              const screenY = getRowScreenY(player.currentRow, config, game.cameraY)
              game.particles = [
                ...game.particles,
                ...createGemParticles(landedPlatform.x, screenY - config.tileDepth - 18),
              ]
              playGemSound()
            }
            
            playLandSound()
            
            // Move camera to follow player
            game.targetCameraY = Math.max(0, (player.currentRow - 2) * config.rowSpacing)
            
            // Generate new platforms ahead
            const maxRow = Math.max(...platforms.map(p => p.row))
            if (player.currentRow > maxRow - 8) {
              for (let row = maxRow + 1; row <= maxRow + 5; row++) {
                const newPlatforms = generatePlatformsForRow(row, config, game.score)
                platforms.push(...newPlatforms)
              }
            }
            
            // Remove old platforms
            game.platforms = platforms.filter(p => p.row >= player.currentRow - 3)
          } else {
            // Missed! Fall to death
            player.isFalling = true
            player.fallProgress = 0
            player.currentPlatform = null
            const screenY = getRowScreenY(player.targetRow, config, game.cameraY)
            game.particles = [...game.particles, ...createFallParticles(player.x, screenY)]
            playFallSound()
          }
        }
      }
      
      // Update falling
      if (player.isFalling) {
        player.fallProgress += deltaTime / 600

        if (player.fallProgress >= 1) {
          game.state = 'gameover'

          if (game.score > game.highScore) {
            game.highScore = game.score
            saveHighScore(game.score)
          }

          // Notify Flutter app about game end
          if (window.FlutterBridge) {
            window.FlutterBridge.postMessage(JSON.stringify({
              event: 'gameEnd',
              score: game.score,
              highScore: game.highScore
            }))
          }
        }
      }
      
      // Smooth camera follow
      game.cameraY = lerp(game.cameraY, game.targetCameraY, 0.08)
    }
    
    // Update particles
    game.particles = updateParticles(game.particles, deltaTime)
    
    // Render
    renderGame(ctx, game)
    
    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [canvasRef])
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth, 400)
      const height = Math.min(window.innerHeight, 700)
      setDimensions({ width, height })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Initialize game
  useEffect(() => {
    gameRef.current = initGame(dimensions.width, dimensions.height)
  }, [dimensions, initGame])
  
  // Start game loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop])
  
  return {
    dimensions,
    handleTap,
  }
}
