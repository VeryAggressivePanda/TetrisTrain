import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';

// Update status function
function updateStatus(message) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
    }
    const gameStatus = document.getElementById('game-status');
    if (gameStatus) {
        gameStatus.textContent = message;
    }
    console.log('TetrisTrain:', message);
}

updateStatus('Initializing game...');

// Game configuratie - Mobile friendly
const config = {
    type: Phaser.CANVAS, // Explicit CANVAS voor mobiel
    width: 375,
    height: 600,
    parent: 'phaser-game',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 375,
        height: 600
    },
    scene: [GameScene],
    // Simpele render instellingen voor mobiel
    render: {
        antialias: false,
        pixelArt: true,
        autoResize: false
    }
};

updateStatus('Starting Phaser game...');

try {
    // Start de game
    const game = new Phaser.Game(config);
    
    // Global game instance voor debugging
    window.game = game;
    
    // Game event listeners
    game.events.on('ready', () => {
        updateStatus('Game ready!');
        setTimeout(() => {
            const status = document.getElementById('status');
            if (status) {
                status.style.display = 'none';
            }
        }, 2000);
    });
    
    game.events.on('destroy', () => {
        updateStatus('Game destroyed');
    });
    
    updateStatus('Game instance created');
    
} catch (error) {
    updateStatus(`Error starting game: ${error.message}`);
    console.error('Game startup error:', error);
    
    // Ultieme fallback: minimale config
    setTimeout(() => {
        updateStatus('Trying minimal fallback...');
        try {
            const minimalConfig = {
                type: Phaser.CANVAS,
                width: 375,
                height: 600,
                parent: 'phaser-game',
                backgroundColor: '#2c3e50',
                scene: [GameScene]
            };
            const fallbackGame = new Phaser.Game(minimalConfig);
            window.game = fallbackGame;
            updateStatus('Minimal fallback loaded');
        } catch (fallbackError) {
            updateStatus(`All fallbacks failed: ${fallbackError.message}`);
            // Toon een simpele HTML fallback
            document.getElementById('phaser-game').innerHTML = `
                <div style="color: white; text-align: center; padding: 20px;">
                    <h2>Game Loading Issue</h2>
                    <p>Your browser: ${navigator.userAgent}</p>
                    <p>Error: ${fallbackError.message}</p>
                    <p>Try refreshing the page or use a different browser.</p>
                </div>
            `;
        }
    }, 1000);
} 