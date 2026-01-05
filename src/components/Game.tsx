import { useRef, useEffect, useCallback } from 'react'
import { useGame } from '@/hooks/useGame'

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { dimensions, handleTap } = useGame(canvasRef)
  
  // Handle touch events
  const handlePointerDown = useCallback((e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    handleTap()
  }, [handleTap])
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        handleTap()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTap])
  
  // Prevent default touch behaviors
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      e.preventDefault()
    }
    
    document.addEventListener('touchstart', preventDefault, { passive: false })
    document.addEventListener('touchmove', preventDefault, { passive: false })
    
    return () => {
      document.removeEventListener('touchstart', preventDefault)
      document.removeEventListener('touchmove', preventDefault)
    }
  }, [])
  
  return (
    <div className="game-container w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="game-canvas touch-none select-none rounded-lg shadow-2xl cursor-pointer"
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handlePointerDown}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          touchAction: 'none',
        }}
      />
    </div>
  )
}

export default Game
