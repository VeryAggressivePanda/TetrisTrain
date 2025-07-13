# Tetris Train

Een mobiele game waar een treintje rijdt over rails die op Tetris blokken zijn uitgelegd.

## Concept

- **Tetris gameplay**: Blokken vallen en kunnen geroteerd/bewogen worden
- **Trein element**: Een treintje rijdt over de rails op de blokken
- **Doel**: Zorg dat het spoor op tijd wordt aangevuld door de juiste tetris blokken op de juiste plek te plaatsen

## Technische Setup

- **Framework**: Phaser.js 3.90.0
- **Bundler**: Vite
- **Target**: Mobile browsers (responsive design)

## Installatie

```bash
npm install
```

## Development

```bash
npm run dev
```

Open je browser op `http://localhost:5173`

## Huidige Status

### ✅ Geïmplementeerd

- Basis Phaser.js setup
- Responsive mobile layout
- Train sprite met rook effect
- 4 rijen tetris blokken met railspatronen
- Trein beweegt horizontaal over de rails
- Verschillende railspatronen (horizontaal, verticaal, bocht)

### 🔜 Volgende stappen

1. **Tetris blokken laten vallen**
2. **Input controls** (touch/keyboard)
3. **Collision detection** tussen trein en rails
4. **Game over logica** wanneer trein geen rails heeft
5. **Score systeem**
6. **Sound effects**

## File Structuur

```
src/
├── main.js              # Game configuratie en setup
├── scenes/
│   └── GameScene.js     # Main game scene
└── sprites/
    ├── Train.js         # Trein sprite
    └── TetrisBlock.js   # Tetris blokken met railspatronen
```

## Game Design

- **Grid**: 10x20 tetris grid
- **Blok grootte**: 30x30 pixels
- **Trein**: Beweegt horizontaal over de rails
- **Rails**: Verschillende patronen (recht, bocht, verticaal)
- **Mobile first**: Ontworpen voor touch input

## Performance Regels

Volgens de project regels:
- Clean code principes
- File-by-file changes
- Performance optimalisatie voor mobile
- Responsive design 