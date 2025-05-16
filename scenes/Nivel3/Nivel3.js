import { createAnimations } from "../../gameMechanics/animations.js";
import { createMario } from "../../entities/Mario.js";
import { createGoombas } from "../../entities/Goomba.js";
import { updateCharacterBehaviors } from "../../gameMechanics/characterUpdates.js";
import { handleCollisions } from "../../gameMechanics/collisions.js";
import { loadAssets1 } from "../../assets/assets.js";
import { saveUserScore } from "../../gameMechanics/scoreTracking.js";

export class Nivel3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Nivel3' });
        this.resetVariables();
    }

    // Método para reiniciar todas las variables
    resetVariables() {
        this.levelCompleted = false;
        this.mario = null;
        this.goombas = null;
        this.minY = 0;
        this.isMovingUp = false;
        this.startY = 0;
        this.endY = 0;
        this.totalDistance = 0;
        this.lastProgressPercent = 0;
        this.goombaSpawnTimer = null;
        this.placedBlocks = []; // Para almacenar las posiciones de los bloques
        this.score = 0; // Puntuación del jugador
        this.progressText = null; // Texto para mostrar el progreso
        this.progressBar = null; // Barra de progreso visual
        this.progressBarBackground = null; // Fondo de la barra de progreso
    }

    preload() {
        // Mostrar texto de carga
        const loadingText = this.add.text(640, 360, 'Cargando nivel 3...', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Mostrar una barra de carga
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff // blanco
            }
        });
        
        this.load.on('progress', (percent) => {
            loadingBar.fillRect(240, 400, 800 * percent, 30);
            loadingText.setText(`Cargando nivel 3... ${Math.floor(percent * 100)}%`);
        });
        
        this.load.on('complete', () => {
            loadingBar.destroy();
            loadingText.destroy();
        });
        
        // Cargar recursos usando la función loadAssets1
        loadAssets1(this);
        
        // Cargar la imagen de llama si no está ya cargada
        if (!this.textures.exists('llama')) {
            this.load.image('llama', 'assets/blocks/overworld/llama.png');
        }
    }

    create() {
        console.log("Nivel3: create iniciado");
        
        // Reiniciar variables al iniciar la escena
        this.resetVariables();

        this.physics.world.setBounds(0, 0, 1280, 10000);
        this.cameras.main.setBounds(0, 0, 1280, 10000);
        this.cameras.main.setScroll(0, 10000);

        let worldHeight = 10000;
        const numberOfClouds = 1000; 
        const cloudHeight = 50; 
        let lastY = 0; 
        const minDistance = cloudHeight + 50;  

        for (let i = 0; i < numberOfClouds; i++) {
            const randomX = Phaser.Math.Between(50, 1200);
            const randomY = lastY + Phaser.Math.Between(minDistance, minDistance + 100);
            if (randomY + cloudHeight > 10000) {
                break;
            }
            const cloud = this.add.image(randomX, randomY, 'cloud1').setOrigin(0, 0).setScale(0.5);
            lastY = cloud.y + cloud.displayHeight;
        }

        // Crear el suelo completo al inicio
        this.floor = this.physics.add.staticGroup();
        let floorWidth = 48; // Ancho de un bloque de suelo con escala 3 (16 * 3)
        
        // Crear un suelo completo al inicio
        for (let x = 0; x < 1280; x += floorWidth) {
            this.floor.create(x, worldHeight - 16, 'floorbricks')
                .setOrigin(0, 0.5)
                .setScale(3)
                .refreshBody();
        }
        
        // Crear algunos huecos en el suelo más adelante para hacer el juego más desafiante
        // (estos huecos estarán fuera de la pantalla inicial)
        const holePositions = [1500, 1800, 2200]; // Posiciones X donde habrá huecos
        const holeWidth = 100; // Ancho de los huecos
        
        for (let x = 1280; x < 3000; x += floorWidth) {
            // Verificar si esta posición debe ser un hueco
            let isHole = false;
            for (const holePos of holePositions) {
                if (x >= holePos && x < holePos + holeWidth) {
                    isHole = true;
                    break;
                }
            }
            
            // Si no es un hueco, crear un bloque de suelo
            if (!isHole) {
                this.floor.create(x, worldHeight - 16, 'floorbricks')
                    .setOrigin(0, 0.5)
                    .setScale(3)
                    .refreshBody();
            }
        }

        // Crear grupo de bloques
        this.blocks = this.physics.add.staticGroup();
        
        // Crear grupo de bloques de llama
        this.flameBlocks = this.physics.add.staticGroup();
        
        // Definir parámetros para la generación de bloques
        const blockHeight = 16;
        const blockScale = 3;
        const scaledBlockHeight = blockHeight * blockScale;
        const scaledBlockWidth = 16 * blockScale; // Asumiendo que el ancho del bloque es 16px
        
        // Inicializar el array para almacenar las posiciones de los bloques
        this.placedBlocks = [];
        
        // Función para verificar si un nuevo bloque se superpone con alguno existente
        const isOverlapping = (x, y, width, height) => {
            const margin = 5; // Pequeño margen para evitar bloques demasiado cercanos
            for (const block of this.placedBlocks) {
                if (
                    x < block.x + block.width + margin &&
                    x + width + margin > block.x &&
                    y < block.y + block.height + margin &&
                    y + height + margin > block.y
                ) {
                    return true; // Hay superposición
                }
            }
            return false; // No hay superposición
        };
        
        // Función para crear un bloque si no se superpone con otros
        const tryCreateBlock = (x, y) => {
            if (!isOverlapping(x, y, scaledBlockWidth, scaledBlockHeight)) {
                // Decidir aleatoriamente si crear un bloque normal o un bloque de llama
                const isFlameBlock = Phaser.Math.Between(0, 100) < 20; // 20% de probabilidad de ser un bloque de llama
                
                if (isFlameBlock) {
                    // Crear un bloque de llama
                    this.flameBlock = this.flameBlocks.create(x, y, 'llama')
                        .setOrigin(0, 0)
                        .setScale(blockScale)
                        .refreshBody();
                } else {
                    // Crear un bloque normal
                    this.block = this.blocks.create(x, y, 'block')
                        .setOrigin(0, 0)
                        .setScale(blockScale)
                        .refreshBody();
                }
                
                // Registrar este bloque como colocado
                this.placedBlocks.push({
                    x: x,
                    y: y,
                    width: scaledBlockWidth,
                    height: scaledBlockHeight
                });
                
                return true; // Bloque creado exitosamente
            }
            return false; // No se pudo crear el bloque
        };
        
        // Dividir el mundo en secciones verticales para una distribución más regular
        const totalSections = 40; // Número de secciones verticales
        const sectionHeight = (worldHeight - 1000) / totalSections;
        
        // Crear bloques en cada sección - REDUCIDO el número de plataformas por sección
        for (let section = 0; section < totalSections; section++) {
            const sectionY = worldHeight - 300 - (section * sectionHeight);
            
            // REDUCIDO: Número de plataformas en esta sección (de 4-8 a 2-4)
            const platformsInSection = Phaser.Math.Between(2, 4);
            
            for (let p = 0; p < platformsInSection; p++) {
                // Intentar colocar una plataforma hasta 10 veces
                let platformPlaced = false;
                let attempts = 0;
                
                while (!platformPlaced && attempts < 10) {
                    // Posición X aleatoria para la plataforma
                    const platformX = Phaser.Math.Between(100, 1100 - scaledBlockWidth * 3);
                    
                    // REDUCIDO: Longitud de la plataforma (de 2-4 a 1-2)
                    const platformLength = Phaser.Math.Between(1, 2);
                    
                    // Pequeña variación en Y para que no todas las plataformas estén exactamente a la misma altura
                    const yVariation = Phaser.Math.Between(-30, 30);
                    const platformY = sectionY + yVariation;
                    
                    // Verificar si toda la plataforma puede colocarse sin superposiciones
                    let canPlacePlatform = true;
                    for (let j = 0; j < platformLength; j++) {
                        if (isOverlapping(
                            platformX + (j * scaledBlockWidth), 
                            platformY, 
                            scaledBlockWidth, 
                            scaledBlockHeight
                        )) {
                            canPlacePlatform = false;
                            break;
                        }
                    }
                    
                    // Si podemos colocar toda la plataforma, hacerlo
                    if (canPlacePlatform) {
                        for (let j = 0; j < platformLength; j++) {
                            tryCreateBlock(
                                platformX + (j * scaledBlockWidth), 
                                platformY
                            );
                        }
                        platformPlaced = true;
                    }
                    
                    attempts++;
                }
            }
        }
        
        // REDUCIDO: Crear algunas plataformas adicionales cerca del suelo para facilitar el inicio
        for (let i = 0; i < 8; i++) { // Reducido de 15 a 8
            // Intentar colocar una plataforma hasta 10 veces
            let platformPlaced = false;
            let attempts = 0;
            
            while (!platformPlaced && attempts < 10) {
                const platformX = Phaser.Math.Between(100, 1100 - scaledBlockWidth * 3);
                const platformY = worldHeight - 150 - Phaser.Math.Between(50, 200);
                // REDUCIDO: Longitud de la plataforma (de 2-4 a 1-2)
                const platformLength = Phaser.Math.Between(1, 2);
                
                // Verificar si toda la plataforma puede colocarse sin superposiciones
                let canPlacePlatform = true;
                for (let j = 0; j < platformLength; j++) {
                    if (isOverlapping(
                        platformX + (j * scaledBlockWidth), 
                        platformY, 
                        scaledBlockWidth, 
                        scaledBlockHeight
                    )) {
                        canPlacePlatform = false;
                        break;
                    }
                }
                
                // Si podemos colocar toda la plataforma, hacerlo
                if (canPlacePlatform) {
                    for (let j = 0; j < platformLength; j++) {
                        tryCreateBlock(
                            platformX + (j * scaledBlockWidth), 
                            platformY
                        );
                    }
                    platformPlaced = true;
                }
                
                attempts++;
            }
        }
        // Crear una ruta principal de subida en zigzag
        let zigzagX = 200;
        let zigzagY = worldHeight - 300;
        const zigzagSteps = 50;
        const zigzagHeight = (worldHeight - 800) / zigzagSteps;
        
        for (let i = 0; i < zigzagSteps; i++) {
            // Intentar colocar una plataforma hasta 10 veces
            let platformPlaced = false;
            let attempts = 0;
            
            while (!platformPlaced && attempts < 10) {
                // Crear una plataforma en cada paso del zigzag
                // REDUCIDO: Longitud de la plataforma (de 2-4 a 1-2)
                const platformLength = Phaser.Math.Between(1, 2);
                
                // Verificar si toda la plataforma puede colocarse sin superposiciones
                let canPlacePlatform = true;
                for (let j = 0; j < platformLength; j++) {
                    if (isOverlapping(
                        zigzagX + (j * scaledBlockWidth), 
                        zigzagY, 
                        scaledBlockWidth, 
                        scaledBlockHeight
                    )) {
                        canPlacePlatform = false;
                        break;
                    }
                }
                
                // Si podemos colocar toda la plataforma, hacerlo
                if (canPlacePlatform) {
                    for (let j = 0; j < platformLength; j++) {
                        tryCreateBlock(
                            zigzagX + (j * scaledBlockWidth), 
                            zigzagY
                        );
                    }
                    platformPlaced = true;
                } else {
                    // Si no podemos colocar la plataforma, intentar con una posición X ligeramente diferente
                    zigzagX += Phaser.Math.Between(-50, 50);
                    // Asegurarse de que zigzagX esté dentro de los límites
                    zigzagX = Phaser.Math.Clamp(zigzagX, 100, 1100 - platformLength * scaledBlockWidth);
                }
                
                attempts++;
            }
            
            // Mover hacia arriba
            zigzagY -= zigzagHeight;
            
            // Alternar entre izquierda y derecha
            if (i % 2 === 0) {
                zigzagX = Phaser.Math.Between(700, 1000 - 4 * scaledBlockWidth);
            } else {
                zigzagX = Phaser.Math.Between(100, 400);
            }
        }

        // Crear animaciones antes de crear los personajes
        createAnimations(this);

        // Crear a Mario y configurarlo para que colisione con los bordes del mundo
        this.mario = createMario(this);
        
        if (!this.mario) {
            console.error("Error: No se pudo crear a Mario");
            return;
        }
        
        this.mario.setCollideWorldBounds(true);
        this.mario.isDead = false; // Asegurarse de que Mario no esté muerto al iniciar

        // Crear goombas iniciales
        this.goombas = this.physics.add.group();
        this.goombas = createGoombas(this, [
            [500, worldHeight - 100],
            [800, worldHeight - 100],
            [1200, worldHeight - 100]
        ]);

        // Configurar colisiones básicas
        handleCollisions(this);
        
        // Configurar colisión con bloques de llama (letal para Mario)
        this.physics.add.collider(this.mario, this.flameBlocks, (mario, flameBlock) => {
            if (!mario.isDead) {
                // Mario ha tocado un bloque de llama
                mario.isDead = true;
                mario.anims.play('mario-dead');
                this.sound.stopAll();
                this.sound.add('dead', { volume: 0.5 }).play();
                
                setTimeout(() => {
                    mario.setVelocityY(-350);
                }, 100);

                setTimeout(() => {
                    this.scene.restart();
                }, 2000);
            }
        });
        
        // Configurar colisiones entre goombas y bloques de llama
        this.physics.add.collider(this.goombas, this.flameBlocks);
        
        // Configurar la cámara para seguir a Mario
        this.cameras.main.startFollow(this.mario, true, 0, 1); 

        // Configurar controles - Asegurarse de que se crean nuevos controles cada vez
        this.keys = this.input.keyboard.createCursorKeys();
        
        // Reproducir música de fondo
        try {
            this.sound.add('theme', { volume: 0.5, loop: true }).play();
        } catch (error) {
            console.warn("No se pudo reproducir la música del tema:", error);
        }

        this.minY = worldHeight - 100; // Posición inicial de Mario
        this.isMovingUp = false;
        
        // Configuración para el contador de progreso
        this.startY = worldHeight - 100; // Posición inicial (parte inferior)
        this.endY = 500; // Posición final (parte superior)
        this.totalDistance = this.startY - this.endY; // Distancia total a recorrer
        this.lastProgressPercent = 0; // Para rastrear cuando llegamos al 100%
        
        // Crear el texto del contador de progreso
        this.progressText = this.add.text(20, 20, 'Progreso: 0%', { 
            fontSize: '24px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Arial'
        });
        this.progressText.setScrollFactor(0); // Fijar a la cámara

        // Crear una barra de progreso visual
        this.progressBarBackground = this.add.rectangle(640, 50, 400, 30, 0x000000);
        this.progressBarBackground.setScrollFactor(0);
        this.progressBarBackground.setAlpha(0.7);

        this.progressBar = this.add.rectangle(640 - 200, 50, 0, 20, 0x00ff00);
        this.progressBar.setScrollFactor(0);
        this.progressBar.setOrigin(0, 0.5);
        
        // Crear un botón para volver al menú principal
        this.menuButton = this.add.text(1200, 20, 'Menú', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Arial'
        });
        this.menuButton.setScrollFactor(0); // Fijar a la cámara
        this.menuButton.setInteractive();
        this.menuButton.on('pointerover', () => {
            this.menuButton.setFontSize(28);
        });
        this.menuButton.on('pointerout', () => {
            this.menuButton.setFontSize(24);
        });
        this.menuButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('MainMenu');
        });
        
        // Configurar el temporizador para generar goombas aleatorios
        this.setupGoombaSpawner();
        
        console.log("Nivel3: create completado");
    }

    // Método para configurar el generador de goombas aleatorios
    setupGoombaSpawner() {
        // Crear un temporizador que genere goombas cada cierto tiempo
        this.goombaSpawnTimer = this.time.addEvent({
            delay: 1000, // Generar goombas cada segundo
            callback: this.spawnTopGoombas,
            callbackScope: this,
            loop: true
        });
    }

    // Método para generar múltiples goombas desde la parte superior
    spawnTopGoombas() {
        if (this.levelCompleted || this.mario.isDead) return;
        this.spawnSingleTopGoomba();
    }

    // Método para generar un solo goomba desde la parte superior
    spawnSingleTopGoomba() {
        // Obtener la posición visible de la cámara
        const cameraViewX = this.cameras.main.scrollX;
        const cameraViewY = this.cameras.main.scrollY;
        const screenWidth = 1280; // Ancho de la pantalla según config.js
        
        // Generar una posición X aleatoria dentro del ancho de la pantalla
        const x = cameraViewX + Phaser.Math.Between(50, screenWidth - 50);
        
        // Generar la posición Y por encima de la cámara
        const y = cameraViewY - Phaser.Math.Between(50, 150);
        
        // Verificar si la posición es válida (no está dentro de un bloque)
        let validPosition = true;
        for (const block of this.placedBlocks) {
            if (
                x >= block.x && x <= block.x + block.width &&
                y >= block.y && y <= block.y + block.height
            ) {
                validPosition = false;
                break;
            }
        }
        
        if (validPosition) {
            // Crear un nuevo goomba en la posición aleatoria
            const goomba = this.goombas.create(x, y, 'goomba')
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
        }
    }

    update() {
        // Verificar que mario existe antes de actualizar
        if (!this.mario) {
            console.warn('Mario no está definido en update');
            return;
        }
        
        // Si el nivel ya está completado, no hacer nada más
        if (this.levelCompleted) return;
        
        // Actualizar comportamientos de personajes si Mario no está muerto
        if (!this.mario.isDead) {
            updateCharacterBehaviors(this);
            
            // Incrementar la puntuación basada en el tiempo
            this.score += 0.1;
        }
        
        // Actualizar la cámara para seguir a Mario cuando sube
        if (this.mario.y < this.minY) {
            this.cameras.main.startFollow(this.mario, true, 0, 1); 
            this.minY = this.mario.y;
            this.isMovingUp = true; 
        }

        if (this.mario.y > this.minY && this.isMovingUp) {
            this.cameras.main.stopFollow();
            this.isMovingUp = false;
        }
        
        // Calcular el progreso actual
        let currentDistance = this.startY - this.mario.y;
        let progressPercent = Math.min(100, Math.max(0, Math.floor((currentDistance / this.totalDistance) * 100)));
        
        // Actualizar el texto del contador de progreso
        this.progressText.setText(`Progreso: ${progressPercent}%`);

        // Actualizar la barra de progreso
        this.progressBar.width = (progressPercent / 100) * 400;

        // Cambiar el color de la barra según el progreso
        if (progressPercent < 30) {
            this.progressBar.fillColor = 0xff0000; // Rojo
        } else if (progressPercent < 70) {
            this.progressBar.fillColor = 0xffff00; // Amarillo
        } else {
            this.progressBar.fillColor = 0x00ff00; // Verde
        }
        
        // Verificar si hemos alcanzado el 100% por primera vez
        if (progressPercent === 100 && this.lastProgressPercent < 100) {
            this.showCompletionMessage();
        }
        
        // Actualizar el último porcentaje de progreso
        this.lastProgressPercent = progressPercent;
        
        // Verificar si Mario cae fuera de la pantalla
        if (!this.mario.isDead && this.mario.y > this.cameras.main.scrollY + this.cameras.main.height) {
            this.mario.isDead = true;
            this.mario.anims.play('mario-dead');
            this.sound.stopAll();
            this.sound.add('dead', { volume: 0.5 }).play();
            
            setTimeout(() => {
                this.scene.restart();
            }, 2000);
        }
        
        // Eliminar goombas que están muy lejos de la cámara
        this.cleanupDistantGoombas();
    }
    
    // Método para eliminar goombas que están muy lejos de la cámara
    cleanupDistantGoombas() {
        if (!this.goombas || !this.goombas.children) return;
        
        const cameraViewX = this.cameras.main.scrollX;
        const cameraViewY = this.cameras.main.scrollY;
        const cameraViewWidth = this.cameras.main.width;
        const cameraViewHeight = this.cameras.main.height;
        
        this.goombas.children.iterate((goomba) => {
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
    
    // Método que se ejecuta cuando se detiene la escena
    shutdown() {
        // Detener el temporizador de generación de goombas
        if (this.goombaSpawnTimer) {
            this.goombaSpawnTimer.remove();
            this.goombaSpawnTimer = null;
        }
        
        // Limpiar recursos
        this.sound.stopAll();
        
        // Reiniciar variables
        this.resetVariables();
        
        console.log("Nivel3: shutdown completado");
    }
    
    showCompletionMessage() {
        // Marcar el nivel como completado
        this.levelCompleted = true;
        
        // Detener el temporizador de generación de goombas
        if (this.goombaSpawnTimer) {
            this.goombaSpawnTimer.remove();
            this.goombaSpawnTimer = null;
        }
        
        // Detener a Mario
        this.mario.setVelocity(0, 0);
        this.mario.body.allowGravity = false;
        
        // Detener la música del nivel
        this.sound.stopAll();
        
        // Reproducir sonido de victoria
        try {
            this.sound.add('jump', { volume: 0.5 }).play();
        } catch (error) {
            console.warn("No se pudo reproducir el sonido de victoria:", error);
        }
        
        // Calcular puntuación final sumando bonificaciones
        // Asegurarse de que la puntuación base sea alta (similar a niveles 1 y 2)
        const baseScore = 20000; // Puntuación base alta
        const timeBonus = Math.max(0, 5000 - Math.floor(this.time.now / 1000) * 10); // Bonus por tiempo rápido
        const difficultyBonus = 10000; // Bonus adicional por ser nivel 3 (más alto que en niveles anteriores)
        const finalScore = baseScore + timeBonus + difficultyBonus; // Puntuación total (superior a 30000)
        
        console.log(`Puntuación final: ${finalScore} (Base: ${baseScore}, Tiempo: ${timeBonus}, Dificultad: ${difficultyBonus})`);
        
        // Guardar la puntuación en la clasificación
        saveUserScore(finalScore);
        
        // Crear un fondo semitransparente
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setScrollFactor(0);
        
        // Crear el panel de mensaje
        const messagePanel = this.add.rectangle(640, 360, 600, 400, 0x333333)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setStrokeStyle(4, 0xffff00);
        
        // Título de felicitación
        const congratsText = this.add.text(640, 200, '¡NIVEL COMPLETADO!', {
            fontSize: '48px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Mensaje de completado
        const messageText = this.add.text(640, 270, '¡Has completado el Nivel 3!', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Mensaje adicional
        const additionalText = this.add.text(640, 320, '¡Felicidades! Has superado todos los niveles', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Mostrar puntuación
        const scoreText = this.add.text(640, 370, `Puntuación: ${finalScore}`, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Botón para volver al menú principal (único botón)
        const menuButton = this.add.rectangle(640, 460, 300, 60, 0x0000aa)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive();
        
        const menuText = this.add.text(640, 460, 'VOLVER AL MENÚ', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Efectos de hover para el botón del menú
        menuButton.on('pointerover', () => {
            menuButton.fillColor = 0x0000ff;
            menuText.setFontSize(32);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.fillColor = 0x0000aa;
            menuText.setFontSize(28);
        });
        
        // Acción del botón del menú
        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        // Desactivar controles de Mario
        this.mario.isDead = true;
    }
}
