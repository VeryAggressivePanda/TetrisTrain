import Phaser from 'phaser';

export default class TetrisShape extends Phaser.GameObjects.Container {
    constructor(scene, x, y, shapeType) {
        super(scene, x, y);
        
        // Voeg toe aan de scene
        scene.add.existing(this);
        
        // Eigenschappen
        this.shapeType = shapeType;
        this.currentRotation = 0;
        this.blockSize = 30;
        this.blocks = [];
        this.railPath = [];
        this.isFalling = false;
        this.gridX = 0;
        this.gridY = 0;
        
        // Zet depth voor juiste layering
        this.setDepth(50);
        
        // Definieer shape data
        this.shapeData = this.getShapeData(shapeType);
        
        // Maak de blokken
        this.createBlocks();
        
        // Maak het railspatroon
        this.createRailPath();
    }
    
    getShapeData(shapeType) {
        const shapeDefinitions = {
            'I': {
                rotations: [
                    [[0, 0], [1, 0], [2, 0], [3, 0]],
                    [[0, 0], [0, 1], [0, 2], [0, 3]],
                    [[0, 0], [1, 0], [2, 0], [3, 0]],
                    [[0, 0], [0, 1], [0, 2], [0, 3]]
                ],
                color: 0x00ffff,
                railType: 'straight'
            },
            'O': {
                rotations: [
                    [[0, 0], [1, 0], [0, 1], [1, 1]],
                    [[0, 0], [1, 0], [0, 1], [1, 1]],
                    [[0, 0], [1, 0], [0, 1], [1, 1]],
                    [[0, 0], [1, 0], [0, 1], [1, 1]]
                ],
                color: 0xffff00,
                railType: 'loop'
            },
            'T': {
                rotations: [
                    [[1, 0], [0, 1], [1, 1], [2, 1]],
                    [[1, 0], [1, 1], [2, 1], [1, 2]],
                    [[0, 1], [1, 1], [2, 1], [1, 2]],
                    [[1, 0], [0, 1], [1, 1], [1, 2]]
                ],
                color: 0xff00ff,
                railType: 'junction'
            },
            'S': {
                rotations: [
                    [[1, 0], [2, 0], [0, 1], [1, 1]],
                    [[1, 0], [1, 1], [2, 1], [2, 2]],
                    [[1, 0], [2, 0], [0, 1], [1, 1]],
                    [[1, 0], [1, 1], [2, 1], [2, 2]]
                ],
                color: 0x00ff00,
                railType: 'scurve'
            },
            'Z': {
                rotations: [
                    [[0, 0], [1, 0], [1, 1], [2, 1]],
                    [[2, 0], [1, 1], [2, 1], [1, 2]],
                    [[0, 0], [1, 0], [1, 1], [2, 1]],
                    [[2, 0], [1, 1], [2, 1], [1, 2]]
                ],
                color: 0xff0000,
                railType: 'zcurve'
            },
            'J': {
                rotations: [
                    [[0, 0], [0, 1], [1, 1], [2, 1]],
                    [[1, 0], [2, 0], [1, 1], [1, 2]],
                    [[0, 1], [1, 1], [2, 1], [2, 2]],
                    [[1, 0], [1, 1], [0, 2], [1, 2]]
                ],
                color: 0x0000ff,
                railType: 'jcurve'
            },
            'L': {
                rotations: [
                    [[2, 0], [0, 1], [1, 1], [2, 1]],
                    [[1, 0], [1, 1], [1, 2], [2, 2]],
                    [[0, 1], [1, 1], [2, 1], [0, 2]],
                    [[0, 0], [1, 0], [1, 1], [1, 2]]
                ],
                color: 0xffa500,
                railType: 'lcurve'
            }
        };
        
        return shapeDefinitions[shapeType] || shapeDefinitions['I'];
    }
    
    createBlocks() {
        // Verwijder bestaande blokken
        this.destroyBlocks();
        
        const pattern = this.shapeData.rotations[this.currentRotation];
        const color = this.shapeData.color;
        
        for (let [dx, dy] of pattern) {
            const blockX = dx * this.blockSize;
            const blockY = dy * this.blockSize;
            
            // Maak het blok
            const block = this.scene.add.rectangle(blockX, blockY, this.blockSize, this.blockSize, color);
            block.setStrokeStyle(2, 0x000000);
            block.setAlpha(1);
            block.setVisible(true);
            
            // Zet expliciete depth voor elk blok
            block.setDepth(50);
            
            // Voeg toe aan container
            this.add(block);
            this.blocks.push(block);
        }
        
        console.log('Created', this.blocks.length, 'blocks for shape', this.shapeType, 'at position:', this.x, this.y);
    }
    
    destroyBlocks() {
        this.blocks.forEach(block => {
            if (block && block.destroy) {
                block.destroy();
            }
        });
        this.blocks = [];
    }
    
    createRailPath() {
        // Laat dit leeg voor nu, path logic kan later worden toegevoegd
        this.railPath = [];
        
        // Basis railpaden per type
        switch (this.shapeData.railType) {
            case 'straight':
                this.createStraightRailPath();
                break;
            case 'loop':
                this.createLoopRailPath();
                break;
            case 'junction':
                this.createJunctionRailPath();
                break;
            case 'scurve':
                this.createSCurveRailPath();
                break;
            case 'zcurve':
                this.createZCurveRailPath();
                break;
            case 'jcurve':
                this.createJCurveRailPath();
                break;
            case 'lcurve':
                this.createLCurveRailPath();
                break;
        }
    }
    
    createStraightRailPath() {
        // Voor I-piece: rechte lijn
        if (this.currentRotation % 2 === 0) {
            // Horizontaal
            this.railPath = [
                { x: this.x, y: this.y + this.blockSize / 2, direction: 'east' },
                { x: this.x + this.blockSize * 4, y: this.y + this.blockSize / 2, direction: 'east' }
            ];
        } else {
            // Verticaal
            this.railPath = [
                { x: this.x + this.blockSize / 2, y: this.y, direction: 'south' },
                { x: this.x + this.blockSize / 2, y: this.y + this.blockSize * 4, direction: 'south' }
            ];
        }
    }
    
    createLoopRailPath() {
        // Voor O-piece: vierkante loop
        const centerX = this.x + this.blockSize;
        const centerY = this.y + this.blockSize;
        const radius = this.blockSize / 2;
        
        this.railPath = [
            { x: centerX - radius, y: centerY - radius, direction: 'east' },
            { x: centerX + radius, y: centerY - radius, direction: 'south' },
            { x: centerX + radius, y: centerY + radius, direction: 'west' },
            { x: centerX - radius, y: centerY + radius, direction: 'north' }
        ];
    }
    
    createJunctionRailPath() {
        // Voor T-piece: 3-weg junction
        const centerX = this.x + this.blockSize;
        const centerY = this.y + this.blockSize;
        
        this.railPath = [
            { x: centerX, y: centerY - this.blockSize / 2, direction: 'junction' },
            { x: centerX - this.blockSize, y: centerY, direction: 'junction' },
            { x: centerX + this.blockSize, y: centerY, direction: 'junction' },
            { x: centerX, y: centerY + this.blockSize / 2, direction: 'junction' }
        ];
    }
    
    createSCurveRailPath() {
        // Voor S-piece: S-curve
        this.railPath = [
            { x: this.x, y: this.y + this.blockSize / 2, direction: 'east' },
            { x: this.x + this.blockSize, y: this.y + this.blockSize / 2, direction: 'south' },
            { x: this.x + this.blockSize, y: this.y + this.blockSize * 1.5, direction: 'east' },
            { x: this.x + this.blockSize * 2, y: this.y + this.blockSize * 1.5, direction: 'east' }
        ];
    }
    
    createZCurveRailPath() {
        // Voor Z-piece: Z-curve
        this.railPath = [
            { x: this.x + this.blockSize / 2, y: this.y, direction: 'east' },
            { x: this.x + this.blockSize, y: this.y + this.blockSize / 2, direction: 'south' },
            { x: this.x + this.blockSize, y: this.y + this.blockSize, direction: 'east' },
            { x: this.x + this.blockSize * 1.5, y: this.y + this.blockSize, direction: 'east' }
        ];
    }
    
    createJCurveRailPath() {
        // Voor J-piece: J-curve met corner detection
        const baseX = this.x;
        const baseY = this.y;
        
        switch (this.currentRotation) {
            case 0:
                this.railPath = [
                    { x: baseX + this.blockSize / 2, y: baseY, direction: 'south' },
                    { x: baseX + this.blockSize / 2, y: baseY + this.blockSize, direction: 'east' },
                    { x: baseX + this.blockSize * 2.5, y: baseY + this.blockSize, direction: 'east' }
                ];
                break;
            case 1:
                this.railPath = [
                    { x: baseX + this.blockSize, y: baseY + this.blockSize / 2, direction: 'east' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize / 2, direction: 'south' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize * 2.5, direction: 'south' }
                ];
                break;
            case 2:
                this.railPath = [
                    { x: baseX, y: baseY + this.blockSize, direction: 'east' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize, direction: 'south' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize * 2, direction: 'south' }
                ];
                break;
            case 3:
                this.railPath = [
                    { x: baseX, y: baseY, direction: 'east' },
                    { x: baseX + this.blockSize, y: baseY, direction: 'south' },
                    { x: baseX + this.blockSize, y: baseY + this.blockSize * 2, direction: 'south' }
                ];
                break;
        }
    }
    
    createLCurveRailPath() {
        // Voor L-piece: L-curve met corner detection
        const baseX = this.x;
        const baseY = this.y;
        
        switch (this.currentRotation) {
            case 0:
                this.railPath = [
                    { x: baseX + this.blockSize * 2.5, y: baseY, direction: 'south' },
                    { x: baseX + this.blockSize * 2.5, y: baseY + this.blockSize, direction: 'west' },
                    { x: baseX, y: baseY + this.blockSize, direction: 'west' }
                ];
                break;
            case 1:
                this.railPath = [
                    { x: baseX + this.blockSize, y: baseY + this.blockSize / 2, direction: 'south' },
                    { x: baseX + this.blockSize, y: baseY + this.blockSize * 2, direction: 'east' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize * 2, direction: 'east' }
                ];
                break;
            case 2:
                this.railPath = [
                    { x: baseX, y: baseY + this.blockSize, direction: 'east' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize, direction: 'north' },
                    { x: baseX + this.blockSize * 2, y: baseY + this.blockSize * 2, direction: 'north' }
                ];
                break;
            case 3:
                this.railPath = [
                    { x: baseX, y: baseY, direction: 'east' },
                    { x: baseX + this.blockSize, y: baseY, direction: 'south' },
                    { x: baseX + this.blockSize, y: baseY + this.blockSize * 2, direction: 'south' }
                ];
                break;
        }
    }
    
    getRailPath() {
        return this.railPath;
    }
    
    getWorldRailPath() {
        // Converteer local railpad naar world coordinaten
        return this.railPath.map(point => ({
            x: point.x + this.x,
            y: point.y + this.y,
            direction: point.direction
        }));
    }
} 