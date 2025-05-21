export class GoombaSpawner {
    constructor(scene) {
        this.scene = scene;
        this.setupGoombaSpawner();
    }

    // Método para configurar el generador de goombas aleatorios
    setupGoombaSpawner() {
        // Crear un temporizador que genere goombas cada cierto tiempo
        this.scene.goombaSpawnTimer = this.scene.time.addEvent({
            delay: 10000, // Generar goombas cada 5 segundos
            callback: this.spawnTopGoombas,
            callbackScope: this,
            loop: true
        });
    }

    // Método para generar múltiples goombas desde la parte superior
    spawnTopGoombas() {
        if (this.scene.levelCompleted || this.scene.mario.isDead) return;
        
        // Generar entre 2 y 5 goombas cada vez
        const goombasToSpawn = Phaser.Math.Between(1, 3);
        
        for (let i = 0; i < goombasToSpawn; i++) {
            this.spawnSingleTopGoomba();
        }
    }

    // Método para generar un solo goomba desde la parte superior
    spawnSingleTopGoomba() {
        // Obtener la posición visible de la cámara
        const cameraViewX = this.scene.cameras.main.scrollX;
        const cameraViewY = this.scene.cameras.main.scrollY;
        const screenWidth = 1280; // Ancho de la pantalla según config.js
        
        // Generar una posición X aleatoria dentro del ancho de la pantalla
        const x = cameraViewX + Phaser.Math.Between(50, screenWidth - 50);
        
        // Generar la posición Y por encima de la cámara
        const y = cameraViewY - Phaser.Math.Between(50, 150);
        
        // Verificar si la posición es válida (no está dentro de un bloque)
        let validPosition = true;
        if (this.scene.placedBlocks) {
            for (const block of this.scene.placedBlocks) {
                if (
                    x >= block.x && x <= block.x + block.width &&
                    y >= block.y && y <= block.y + block.height
                ) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if (validPosition) {
            // Crear un nuevo goomba en la posición aleatoria
            const goomba = this.scene.goombas.create(x, y, 'goomba')
                .setSize(14, 16)
                .setOrigin(0, 1)
                .setScale(4);
            
            goomba.isDead = false;
            
            // Dar al goomba una velocidad horizontal aleatoria (más lenta)
            const velocityX = Phaser.Math.Between(-40, 40);
            goomba.setVelocityX(velocityX);
            
            // Dar al goomba una velocidad vertical hacia abajo
            const velocityY = Phaser.Math.Between(70, 120);
            goomba.setVelocityY(velocityY);
            
            // Iniciar la animación de caminar
            goomba.anims.play('goomba-walk', true);
            
            console.log(`Goomba generado en (${x}, ${y}) con velocidad X: ${velocityX}, Y: ${velocityY}`);
        }
    }

    // Método para limpiar goombas que están muy lejos de la cámara
    cleanupDistantGoombas() {
        if (!this.scene.goombas || !this.scene.goombas.children) return;
        
        const cameraViewX = this.scene.cameras.main.scrollX;
        const cameraViewY = this.scene.cameras.main.scrollY;
        const cameraViewWidth = this.scene.cameras.main.width;
        const cameraViewHeight = this.scene.cameras.main.height;
        
        this.scene.goombas.children.iterate((goomba) => {
            if (!goomba) return;
            
            // Verificar si el goomba está muy lejos de la cámara
            if (
                goomba.x < cameraViewX - 500 ||
                goomba.x > cameraViewX + cameraViewWidth + 500 ||
                goomba.y < cameraViewY - 500 ||
                goomba.y > cameraViewY + cameraViewHeight + 500
            ) {
                goomba.destroy();
            }
        });
    }
    
    // Método para actualizar el spawner
    update() {
        this.cleanupDistantGoombas();
    }
}
