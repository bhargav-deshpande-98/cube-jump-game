import type { Particle } from './types'
import { COLORS } from './constants'

// Create jump particles
export function createJumpParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3
    const speed = 1 + Math.random() * 2
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      radius: 2 + Math.random() * 2,
      alpha: 1,
      color: COLORS.cubeTop,
    })
  }
  
  return particles
}

// Create fall particles
export function createFallParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 4
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 4,
      alpha: 1,
      color: Math.random() > 0.5 ? COLORS.cubeTop : COLORS.cubeLeft,
    })
  }
  
  return particles
}

// Create gem collection particles
export function createGemParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10
    const speed = 2 + Math.random() * 2
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      radius: 2 + Math.random() * 3,
      alpha: 1,
      color: COLORS.gemColor,
    })
  }
  
  return particles
}

// Update all particles
export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  const dt = deltaTime / 16.67
  
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 0.15 * dt, // gravity
      alpha: p.alpha - 0.025 * dt,
    }))
    .filter(p => p.alpha > 0)
}
