export class TrainPathfinder {
    constructor(scene) {
        this.scene = scene;
        this.shapes = [];
        this.currentPath = [];
        this.currentPathIndex = 0;
        this.isPathValid = false;
        
        console.log('TrainPathfinder initialized');
    }
    
    addShape(shape) {
        this.shapes.push(shape);
        console.log('Added shape to pathfinder:', shape.shapeType, 'at', shape.x, shape.y);
        
        // Rebuild path when new shape is added
        this.rebuildPath();
    }
    
    rebuildPath() {
        console.log('Rebuilding path with', this.shapes.length, 'shapes');
        
        this.currentPath = [];
        this.isPathValid = false;
        
        if (this.shapes.length === 0) {
            console.log('No shapes to build path from');
            return;
        }
        
        // Voor nu, maak een eenvoudig pad van alle shape paths
        for (let shape of this.shapes) {
            const shapePath = shape.getWorldRailPath();
            if (shapePath && shapePath.length > 0) {
                this.currentPath = this.currentPath.concat(shapePath);
            }
        }
        
        if (this.currentPath.length > 0) {
            this.isPathValid = true;
            console.log('Path built with', this.currentPath.length, 'points');
        } else {
            console.log('No valid path could be built');
        }
    }
    
    getCurrentTrainPosition() {
        if (!this.isPathValid || this.currentPath.length === 0) {
            // Default position if no valid path
            return {
                x: this.scene.GRID_OFFSET_X - 50,
                y: this.scene.GRID_OFFSET_Y + (this.scene.GRID_HEIGHT - 4) * this.scene.BLOCK_SIZE + this.scene.BLOCK_SIZE / 2
            };
        }
        
        const currentIndex = this.currentPathIndex % this.currentPath.length;
        return this.currentPath[currentIndex];
    }
    
    getNextTrainPosition() {
        if (!this.isPathValid || this.currentPath.length === 0) {
            return this.getCurrentTrainPosition();
        }
        
        const nextIndex = (this.currentPathIndex + 1) % this.currentPath.length;
        return this.currentPath[nextIndex];
    }
    
    advanceTrainPosition() {
        if (this.isPathValid && this.currentPath.length > 0) {
            this.currentPathIndex = (this.currentPathIndex + 1) % this.currentPath.length;
        }
    }
    
    getTrainRotation(direction) {
        // Converteer direction naar rotatie in radialen
        const rotations = {
            'north': -Math.PI / 2,
            'east': 0,
            'south': Math.PI / 2,
            'west': Math.PI,
            'northeast': -Math.PI / 4,
            'southeast': Math.PI / 4,
            'southwest': 3 * Math.PI / 4,
            'northwest': -3 * Math.PI / 4,
            'junction': 0 // Standaard richting voor junctions
        };
        
        return rotations[direction] || 0;
    }
    
    debugDrawPath(graphics) {
        if (!graphics) return;
        
        graphics.clear();
        
        if (!this.isPathValid || this.currentPath.length === 0) {
            return;
        }
        
        // Teken het pad
        graphics.lineStyle(3, 0x00ff00, 0.8);
        
        for (let i = 0; i < this.currentPath.length - 1; i++) {
            const current = this.currentPath[i];
            const next = this.currentPath[i + 1];
            
            if (current && next) {
                graphics.beginPath();
                graphics.moveTo(current.x, current.y);
                graphics.lineTo(next.x, next.y);
                graphics.strokePath();
            }
        }
        
        // Teken een cirkel bij de huidige trein positie
        if (this.currentPath.length > 0) {
            const currentPos = this.getCurrentTrainPosition();
            graphics.fillStyle(0xff0000, 1);
            graphics.fillCircle(currentPos.x, currentPos.y, 5);
        }
        
        // Teken punten
        graphics.fillStyle(0x0000ff, 0.6);
        for (let point of this.currentPath) {
            graphics.fillCircle(point.x, point.y, 3);
        }
    }
    
    findNearestConnectionPoint(x, y, maxDistance = 50) {
        let nearestPoint = null;
        let minDistance = maxDistance;
        
        for (let shape of this.shapes) {
            const shapePath = shape.getWorldRailPath();
            for (let point of shapePath) {
                const distance = Math.sqrt(
                    Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPoint = point;
                }
            }
        }
        
        return nearestPoint;
    }
    
    canConnect(shape1, shape2) {
        // Eenvoudige connectie check - kijk of shapes dicht bij elkaar zijn
        const path1 = shape1.getWorldRailPath();
        const path2 = shape2.getWorldRailPath();
        
        if (!path1 || !path2 || path1.length === 0 || path2.length === 0) {
            return false;
        }
        
        const maxConnectionDistance = shape1.blockSize * 1.5;
        
        for (let point1 of path1) {
            for (let point2 of path2) {
                const distance = Math.sqrt(
                    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
                );
                
                if (distance <= maxConnectionDistance) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    getConnectedShapes() {
        const connected = [];
        
        for (let i = 0; i < this.shapes.length; i++) {
            for (let j = i + 1; j < this.shapes.length; j++) {
                if (this.canConnect(this.shapes[i], this.shapes[j])) {
                    connected.push([this.shapes[i], this.shapes[j]]);
                }
            }
        }
        
        return connected;
    }
    
    optimizePath() {
        // Eenvoudige path optimalisatie - verwijder duplicate punten
        if (this.currentPath.length < 2) return;
        
        const optimized = [this.currentPath[0]];
        
        for (let i = 1; i < this.currentPath.length; i++) {
            const current = this.currentPath[i];
            const last = optimized[optimized.length - 1];
            
            // Voeg alleen toe als het punt significant anders is
            const distance = Math.sqrt(
                Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2)
            );
            
            if (distance > 5) { // Minimum distance tussen punten
                optimized.push(current);
            }
        }
        
        this.currentPath = optimized;
        console.log('Path optimized from', this.currentPath.length, 'to', optimized.length, 'points');
    }
    
    isValidPath() {
        return this.isPathValid && this.currentPath.length > 0;
    }
    
    getPathLength() {
        return this.currentPath.length;
    }
    
    reset() {
        this.shapes = [];
        this.currentPath = [];
        this.currentPathIndex = 0;
        this.isPathValid = false;
        console.log('TrainPathfinder reset');
    }
} 