import Phaser from 'phaser';
import TetrisShape from '../sprites/TetrisShape.js';
import { TrainPathfinder } from '../sprites/TrainPathfinder.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        console.log('GameScene: preload started');
        
        // Progress bar
        this.load.on('progress', (value) => {
            console.log('Loading progress:', Math.round(value * 100) + '%');
        });
        
        // Maak train sprite
        this.createTrainSprite();
        
        console.log('GameScene: preload finished');
    }

    create() {
        console.log('GameScene: create started');
        
        // Toon dat de scene werkt
        this.add.text(this.cameras.main.centerX, 30, 'Tetris Train', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Game afmetingen
        this.BLOCK_SIZE = 30;
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 18;
        this.GRID_OFFSET_X = (this.cameras.main.width - (this.GRID_WIDTH * this.BLOCK_SIZE)) / 2;
        this.GRID_OFFSET_Y = 80;

        console.log('Grid setup:', {
            width: this.GRID_WIDTH,
            height: this.GRID_HEIGHT,
            blockSize: this.BLOCK_SIZE,
            offsetX: this.GRID_OFFSET_X,
            offsetY: this.GRID_OFFSET_Y
        });

        // Initialiseer het grid
        this.grid = [];
        for (let row = 0; row < this.GRID_HEIGHT; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.GRID_WIDTH; col++) {
                this.grid[row][col] = null;
            }
        }

        // Teken grid lijnen
        this.drawGrid();

        try {
            // Initialize arrays and game state
            this.placedShapes = [];
            this.currentFallingShape = null;
            this.nextShapeType = null;
            this.gameGrid = []; // Track occupied positions
            this.fallSpeed = 1000; // Shape falls every 1000ms
            
            // Initialize game grid
            for (let row = 0; row < this.GRID_HEIGHT; row++) {
                this.gameGrid[row] = [];
                for (let col = 0; col < this.GRID_WIDTH; col++) {
                    this.gameGrid[row][col] = null;
                }
            }

            // Maak pathfinder
            this.pathfinder = new TrainPathfinder(this);
            console.log('Pathfinder created');

            // Maak debug graphics voor path visualization DAARNA (zodat ze boven shapes zijn)
            this.pathGraphics = this.add.graphics();
            this.pathGraphics.setDepth(100); // Zorg dat path boven shapes komt

            // Maak de trein LAATSTE (zodat hij bovenop is)
            this.createTrain();
            console.log('Train created');

            // Start de trein beweging
            this.startTrainMovement();
            console.log('Train movement started');

            // Voeg controls toe
            this.setupControls();
            
            // Start het Tetris game systeem
            this.startTetrisGame();
            
        } catch (error) {
            console.error('Error in create():', error);
            this.add.text(this.cameras.main.centerX, 200, 'Error: ' + error.message, {
                fontSize: '14px',
                fill: '#ff0000',
                wordWrap: { width: 300 }
            }).setOrigin(0.5);
        }
        
        console.log('GameScene: create finished');
    }

    drawGrid() {
        // Teken grid lijnen voor visuele hulp
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.5);
        graphics.setDepth(0); // Zorg dat grid achter alle andere elementen staat
        
        // Verticale lijnen
        for (let col = 0; col <= this.GRID_WIDTH; col++) {
            const x = this.GRID_OFFSET_X + col * this.BLOCK_SIZE;
            graphics.beginPath();
            graphics.moveTo(x, this.GRID_OFFSET_Y);
            graphics.lineTo(x, this.GRID_OFFSET_Y + this.GRID_HEIGHT * this.BLOCK_SIZE);
            graphics.strokePath();
        }
        
        // Horizontale lijnen
        for (let row = 0; row <= this.GRID_HEIGHT; row++) {
            const y = this.GRID_OFFSET_Y + row * this.BLOCK_SIZE;
            graphics.beginPath();
            graphics.moveTo(this.GRID_OFFSET_X, y);
            graphics.lineTo(this.GRID_OFFSET_X + this.GRID_WIDTH * this.BLOCK_SIZE, y);
            graphics.strokePath();
        }
    }

    createTrainSprite() {
        try {
            // Maak een trein sprite vanuit bovenaanzicht (3D perspectief)
            const graphics = this.add.graphics();
            
            // Main trein body (bovenaanzicht)
            graphics.fillStyle(0x8B4513); // Bruin
            graphics.fillRect(0, 0, 32, 48);
            
            // Cabine (donkerder)
            graphics.fillStyle(0x5D2A0A); // Donkerder bruin
            graphics.fillRect(4, 4, 24, 20);
            
            // Schoorsteen (bovenaanzicht)
            graphics.fillStyle(0x666666);
            graphics.fillCircle(16, 12, 4);
            
            // Wielen/rails (bovenaanzicht)
            graphics.fillStyle(0x333333);
            graphics.fillRect(2, 8, 4, 32);
            graphics.fillRect(26, 8, 4, 32);
            
            // Detail: ramen
            graphics.fillStyle(0x87CEEB); // Lichtblauw
            graphics.fillRect(8, 6, 6, 4);
            graphics.fillRect(18, 6, 6, 4);
            
            graphics.generateTexture('train', 32, 48);
            graphics.destroy();
            console.log('Train sprite created (top-down view)');
        } catch (error) {
            console.error('Error creating train sprite:', error);
        }
    }

    startTetrisGame() {
        console.log('Starting Tetris game system');
        
        // Generate first shape
        this.spawnNewShape();
        
        // Start fall timer
        this.fallTimer = this.time.addEvent({
            delay: this.fallSpeed,
            callback: this.makeShapeFall,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnNewShape() {
        if (this.currentFallingShape) {
            // Remove old falling shape
            this.currentFallingShape.destroyBlocks();
        }
        
        // Get next shape type (random for now)
        const shapeTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const shapeType = this.nextShapeType || Phaser.Utils.Array.GetRandom(shapeTypes);
        this.nextShapeType = Phaser.Utils.Array.GetRandom(shapeTypes);
        
        // Spawn at top center of grid
        const spawnCol = Math.floor(this.GRID_WIDTH / 2) - 1;
        const spawnRow = 0;
        
        const x = this.GRID_OFFSET_X + spawnCol * this.BLOCK_SIZE;
        const y = this.GRID_OFFSET_Y + spawnRow * this.BLOCK_SIZE;
        
        // Create new falling shape
        this.currentFallingShape = new TetrisShape(this, x, y, shapeType);
        this.currentFallingShape.isFalling = true;
        this.currentFallingShape.gridX = spawnCol;
        this.currentFallingShape.gridY = spawnRow;
        
        console.log('Spawned new shape:', shapeType, 'at grid position:', spawnCol, spawnRow);
        
        // Check if game over (shape can't be placed)
        if (this.checkCollision(this.currentFallingShape, 0, 0)) {
            console.log('Game Over! Shape can\'t be placed.');
            this.fallTimer.destroy();
        }
    }
    
    makeShapeFall() {
        if (!this.currentFallingShape || !this.currentFallingShape.isFalling) return;
        
        // Try to move shape down
        if (!this.checkCollision(this.currentFallingShape, 0, 1)) {
            // Can move down
            this.moveShape(this.currentFallingShape, 0, 1);
        } else {
            // Can't move down, place the shape
            this.placeShape(this.currentFallingShape);
        }
    }
    
    checkCollision(shape, deltaX, deltaY) {
        const newGridX = shape.gridX + deltaX;
        const newGridY = shape.gridY + deltaY;
        
        // Get shape pattern
        const pattern = shape.shapeData.rotations[shape.currentRotation];
        
        for (let [dx, dy] of pattern) {
            const checkX = newGridX + dx;
            const checkY = newGridY + dy;
            
            // Check bounds
            if (checkX < 0 || checkX >= this.GRID_WIDTH || 
                checkY >= this.GRID_HEIGHT) {
                return true; // Collision with boundaries
            }
            
            // Check collision with placed blocks (not for y < 0, that's spawn area)
            if (checkY >= 0 && this.gameGrid[checkY] && this.gameGrid[checkY][checkX]) {
                return true; // Collision with existing block
            }
        }
        
        return false; // No collision
    }
    
    moveShape(shape, deltaX, deltaY) {
        shape.gridX += deltaX;
        shape.gridY += deltaY;
        
        // Update visual position
        const newX = this.GRID_OFFSET_X + shape.gridX * this.BLOCK_SIZE;
        const newY = this.GRID_OFFSET_Y + shape.gridY * this.BLOCK_SIZE;
        
        shape.x = newX;
        shape.y = newY;
        
        // Recreate blocks at new position
        shape.destroyBlocks();
        shape.createBlocks();
        shape.createRailPath();
    }
    
    placeShape(shape) {
        // Mark grid positions as occupied
        const pattern = shape.shapeData.rotations[shape.currentRotation];
        
        for (let [dx, dy] of pattern) {
            const gridX = shape.gridX + dx;
            const gridY = shape.gridY + dy;
            
            if (gridY >= 0 && gridY < this.GRID_HEIGHT && 
                gridX >= 0 && gridX < this.GRID_WIDTH) {
                this.gameGrid[gridY][gridX] = shape;
            }
        }
        
        // Ensure blocks are properly positioned and visible after placement
        const finalX = this.GRID_OFFSET_X + shape.gridX * this.BLOCK_SIZE;
        const finalY = this.GRID_OFFSET_Y + shape.gridY * this.BLOCK_SIZE;
        
        shape.x = finalX;
        shape.y = finalY;
        
        // Ensure shape and blocks remain visible after placement
        shape.setVisible(true);
        shape.setAlpha(1);
        shape.setDepth(50);
        
        // Zorg dat alle blokken zichtbaar blijven
        shape.blocks.forEach(block => {
            if (block) {
                block.setVisible(true);
                block.setAlpha(1);
                block.setDepth(50);
            }
        });
        
        // Update rail path zonder blocks te recreaten
        shape.createRailPath();
        
        // Add to placed shapes
        shape.isFalling = false;
        this.placedShapes.push(shape);
        
        // Add to pathfinder
        this.pathfinder.addShape(shape);
        
        console.log('Placed shape at grid position:', shape.gridX, shape.gridY, 'pixel position:', finalX, finalY);
        console.log('Shape blocks count:', shape.blocks.length, 'visibility:', shape.blocks.map(b => b.visible));
        
        // Spawn next shape
        this.time.delayedCall(500, () => this.spawnNewShape());
    }
    
    createTrain() {
        try {
            // Start trein onderaan het scherm (vanuit perspectief van schuin boven/achter)
            const trainX = this.cameras.main.centerX;
            const trainY = this.cameras.main.height - 50; // Onderaan het scherm
            
            this.train = this.add.image(trainX, trainY, 'train');
            this.train.setOrigin(0.5, 0.5);
            this.train.setScale(1.2); // Iets groter voor beter zicht
            this.train.setDepth(200); // Zorg dat trein bovenop alles staat
            
            // Start positie voor movement
            this.trainStartX = trainX;
            this.trainStartY = trainY;
            
            console.log('Train positioned at bottom:', trainX, trainY);
            
        } catch (error) {
            console.error('Error creating train:', error);
            // Fallback: simpele rechthoek
            const trainX = this.cameras.main.centerX;
            const trainY = this.cameras.main.height - 50;
            
            this.train = this.add.rectangle(trainX, trainY, 40, 20, 0x8B4513);
            this.train.setStrokeStyle(2, 0x000000);
            this.train.setDepth(200); // Zorg dat trein bovenop alles staat
            
            this.trainStartX = trainX;
            this.trainStartY = trainY;
        }
    }
    
    startTrainMovement() {
        if (!this.train) {
            console.error('No train to move');
            return;
        }
        
        try {
            // Initialize train movement state
            this.trainMovementSpeed = 40; // pixels per second
            this.isTrainMoving = false;
            this.trainCurrentTargetIndex = 0;
            
            // Start de trein beweging van onderaan naar boven
            this.moveTrainUpward();
            
            console.log('Upward train movement started');
            
        } catch (error) {
            console.error('Error starting train movement:', error);
        }
    }

    moveTrainUpward() {
        if (!this.train || this.isTrainMoving) return;
        
        try {
            // Kijk of er geplaatste shapes zijn om langs te rijden
            if (this.placedShapes.length === 0) {
                // Geen shapes, blijf onderaan wachten
                this.train.x = this.trainStartX;
                this.train.y = this.trainStartY;
                this.time.delayedCall(1000, () => this.moveTrainUpward());
                return;
            }
            
            // Sorteer shapes van onderaan naar boven (hoogste Y naar laagste Y)
            const sortedShapes = this.placedShapes.slice().sort((a, b) => b.y - a.y);
            
            // Kies het volgende target
            const targetIndex = this.trainCurrentTargetIndex % sortedShapes.length;
            const targetShape = sortedShapes[targetIndex];
            
            // Bereken doelpositie (bij de shape, iets naar rechts voor beter zicht)
            const targetX = targetShape.x + targetShape.blockSize / 2 + 10;
            const targetY = targetShape.y + targetShape.blockSize / 2;
            
            // Bereken afstand en duur
            const distance = Phaser.Math.Distance.Between(
                this.train.x, this.train.y,
                targetX, targetY
            );
            const duration = (distance / this.trainMovementSpeed) * 1000; // Convert to milliseconds
            
            this.isTrainMoving = true;
            
            // Bereken rotatie op basis van bewegingsrichting (trein wijst naar boven)
            const angle = Phaser.Math.Angle.Between(
                this.train.x, this.train.y,
                targetX, targetY
            );
            
            // Smooth tween naar het target
            this.tweens.add({
                targets: this.train,
                x: targetX,
                y: targetY,
                rotation: angle - Math.PI / 2, // -90 graden zodat trein naar boven wijst
                duration: Math.max(duration, 1000), // Minimum 1000ms voor smooth movement
                ease: 'Power2',
                onComplete: () => {
                    this.isTrainMoving = false;
                    this.trainCurrentTargetIndex++;
                    
                    // Update debug visualization
                    this.updatePathVisualization();
                    
                    // Als we alle shapes hebben bezocht, ga terug naar beneden
                    if (this.trainCurrentTargetIndex >= sortedShapes.length) {
                        this.trainCurrentTargetIndex = 0;
                        // Korte pauze voor het terugkeren
                        this.time.delayedCall(500, () => this.moveTrainUpward());
                    } else {
                        // Continue naar volgende shape
                        this.time.delayedCall(300, () => this.moveTrainUpward());
                    }
                }
            });
            
            console.log('Train moving to shape at:', targetX, targetY, 'rotation:', angle);
            
        } catch (error) {
            console.error('Error moving train upward:', error);
            this.isTrainMoving = false;
            this.time.delayedCall(1000, () => this.moveTrainUpward());
        }
    }

    updatePathVisualization() {
        if (this.pathGraphics) {
            this.pathfinder.debugDrawPath(this.pathGraphics);
        }
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    update() {
        try {
            if (!this.currentFallingShape || !this.currentFallingShape.isFalling) return;
            
            // Handle movement controls
            if (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.moveFallingShape(-1, 0);
            }
            
            if (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.moveFallingShape(1, 0);
            }
            
            if (this.downKey && Phaser.Input.Keyboard.JustDown(this.downKey)) {
                this.moveFallingShape(0, 1);
            }
            
            // Handle rotation
            if (this.spaceBar && Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
                this.rotateFallingShape();
            }
            
        } catch (error) {
            console.error('Error in update:', error);
        }
    }
    
    moveFallingShape(deltaX, deltaY) {
        if (!this.currentFallingShape || !this.currentFallingShape.isFalling) return;
        
        if (!this.checkCollision(this.currentFallingShape, deltaX, deltaY)) {
            this.moveShape(this.currentFallingShape, deltaX, deltaY);
        }
    }
    
    rotateFallingShape() {
        if (!this.currentFallingShape || !this.currentFallingShape.isFalling) return;
        
        // Try rotation
        const oldRotation = this.currentFallingShape.currentRotation;
        this.currentFallingShape.currentRotation = (this.currentFallingShape.currentRotation + 1) % 4;
        
        // Check if rotation is valid
        if (this.checkCollision(this.currentFallingShape, 0, 0)) {
            // Rotation not valid, revert
            this.currentFallingShape.currentRotation = oldRotation;
        } else {
            // Rotation valid, update visuals
            this.currentFallingShape.destroyBlocks();
            this.currentFallingShape.createBlocks();
            this.currentFallingShape.createRailPath();
            console.log('Rotated falling shape');
        }
    }
} 