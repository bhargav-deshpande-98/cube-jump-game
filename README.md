# Cube Jump

A mobile-first clone of the popular "Cube Jump" game built with React, TypeScript, and HTML5 Canvas.

## Game Mechanics

- **Tap/Click** to jump to the next row of platforms
- Time your jumps to land on moving platforms
- Platforms move in alternating directions at different speeds
- Smaller platforms give bonus points
- Collect gems for extra points
- Miss a platform and fall = **Game Over**

## Features

- 🎮 Isometric 3D-style graphics
- 🏃 Moving platforms with varying speeds
- 💎 Gem collectibles for bonus points
- 📈 Progressive difficulty
- ✨ Particle effects
- 🔊 Sound effects
- 📱 Mobile-optimized touch controls
- 🏆 High score persistence

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- HTML5 Canvas

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Controls

- **Mobile**: Tap anywhere to jump
- **Desktop**: Click anywhere or press Space/Up Arrow to jump

## Project Structure

```
src/
├── components/     # React components
│   ├── Game.tsx   # Main game component
│   └── ui/        # UI components
├── hooks/         # Custom React hooks
│   └── useGame.ts # Game logic hook
├── lib/           # Utilities and helpers
│   ├── game/      # Game engine modules
│   └── utils.ts   # General utilities
├── pages/         # Page components
└── App.tsx        # Root component
```

## Scoring

- **+1 point** for each successful jump
- **+1-2 bonus** for landing on smaller platforms
- **+3 points** for collecting gems

## License

MIT
