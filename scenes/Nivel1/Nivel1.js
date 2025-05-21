import { createAnimations } from "../../gameMechanics/animations.js";
import { createMario } from "../../entities/Mario.js";
import { createGoombas } from "../../entities/Goomba.js";
import { updateCharacterBehaviors } from "../../gameMechanics/characterUpdates.js";
import { handleCollisions } from "../../gameMechanics/collisions.js";
import { loadAssets1 } from "../../assets/assets.js";
import { saveUserScore } from "../../gameMechanics/scoreTracking.js";

export class Nivel1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Nivel1' });
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
        this.startTime = 0;
    }

    preload() {
        // Mostrar texto de carga
        const loadingText = this.add.text(640, 360, 'Cargando nivel...', {
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
            loadingText.setText(`Cargando nivel... ${Math.floor(percent * 100)}%`);
        });
        
        this.load.on('complete', () => {
            loadingBar.destroy();
            loadingText.destroy();
        });
        
        // Cargar recursos usando la función loadAssets1
        loadAssets1(this);
    }

    create() {
        console.log("Nivel1: create iniciado");
        
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
        
        // Definir parámetros para la generación de bloques
        const blockHeight = 16;
        const blockScale = 3;
        const scaledBlockHeight = blockHeight * blockScale;
        const scaledBlockWidth = 16 * blockScale; // Asumiendo que el ancho del bloque es 16px
        
        // Array para almacenar las posiciones de los bloques ya colocados
        const placedBlocks = [];
        
        // Función para verificar si un nuevo bloque se superpone con alguno existente
        const isOverlapping = (x, y, width, height) => {
            const margin = 5; // Pequeño margen para evitar bloques demasiado cercanos
            for (const block of placedBlocks) {
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
                this.block = this.blocks.create(x, y, 'block')
                    .setOrigin(0, 0)
                    .setScale(blockScale)
                    .refreshBody();
                
                // Registrar este bloque como colocado
                placedBlocks.push({
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
            const platformsInSection = Phaser.Math.Between(3, 4);
            
            for (let p = 0; p < platformsInSection; p++) {
                // Intentar colocar una plataforma hasta 10 veces
                let platformPlaced = false;
                let attempts = 0;
                
                while (!platformPlaced && attempts < 10) {
                    // Posición X aleatoria para la plataforma
                    const platformX = Phaser.Math.Between(50, 1230 - scaledBlockWidth * 3);
                    
                    // REDUCIDO: Longitud de la plataforma (de 2-4 a 1-2)
                    const platformLength = Phaser.Math.Between(2, 3);
                    
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
                const platformX = Phaser.Math.Between(50,1230 - scaledBlockWidth * 3);
                const platformY = worldHeight - 150 - Phaser.Math.Between(50, 200);
                // REDUCIDO: Longitud de la plataforma (de 2-4 a 1-2)
                const platformLength = Phaser.Math.Between(2,3);
                
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
                const platformLength = Phaser.Math.Between(2,3);
                
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
                    zigzagX = Phaser.Math.Clamp(zigzagX, 50, 1230 - platformLength * scaledBlockWidth);
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

        // Crear goombas
        this.goombas = this.physics.add.group();
        this.goombas = createGoombas(this, [
            [500, worldHeight  - 100],
            [800, worldHeight  - 100],
            [1200, worldHeight  - 100]
        ]);

        // Configurar colisiones
        handleCollisions(this);

        
        // Configurar la cámara para seguir a Mario
        this.cameras.main.startFollow(this.mario, true, 0, 1); 

        // Configurar controles - Asegurarse de que se crean nuevos controles cada vez
        this.keys = this.input.keyboard.createCursorKeys();
        
        // Registrar el tiempo de inicio del nivel
        this.startTime = this.time.now;
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
        
        console.log("Nivel1: create completado");
    }

    update() {
        // Verificar que mario existe antes de actualizar
        if (!this.mario) {
            console.warn('Mario no está definido en update');
            return;
        }
        
        // Si el nivel ya está completado, no hacer nada más
        if (this.levelCompleted) return;
        
        updateCharacterBehaviors(this);
        
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
    }
    
    // Método que se ejecuta cuando se detiene la escena
    shutdown() {
        // Limpiar recursos
        this.sound.stopAll();
        
        // Reiniciar variables
        this.resetVariables();
        
        console.log("Nivel1: shutdown completado");
    }
    
    showCompletionMessage() {
        // Marcar el nivel como completado
        this.levelCompleted = true;
        
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
        
        // Calcular puntuación basada en el tiempo y progreso
        const timeBonus = Math.max(0, 1000 - this.time.now / 1000); // Bonus por tiempo rápido
        const difficultyBonus = 0; // No hay bonus adicional para el nivel 1
        const score = Math.floor(10000 + timeBonus + difficultyBonus); // Puntuación base + bonus
        
        // Guardar la puntuación en la variable de la escena para pasarla al siguiente nivel
        this.score = score;
        
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
        const messageText = this.add.text(640, 270, 'Has completado el Nivel 1', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Mostrar puntuación
        const scoreText = this.add.text(640, 330, `Puntuación: ${score}`, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Botón para continuar al siguiente nivel
        const nextLevelButton = this.add.rectangle(640, 400, 300, 60, 0x00aa00)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive();
        
        const nextLevelText = this.add.text(640, 400, 'SIGUIENTE NIVEL', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Efectos de hover para el botón de siguiente nivel
        nextLevelButton.on('pointerover', () => {
            nextLevelButton.fillColor = 0x00ff00;
            nextLevelText.setFontSize(32);
        });
        
        nextLevelButton.on('pointerout', () => {
            nextLevelButton.fillColor = 0x00aa00;
            nextLevelText.setFontSize(28);
        });
        
        // Acción del botón de siguiente nivel
        nextLevelButton.on('pointerdown', () => {
            // Pasar al Nivel 2 con la puntuación actual
            this.scene.start('Nivel2', { score: score });
        });
        
        // Botón para volver al menú
        const menuButton = this.add.rectangle(640, 480, 300, 60, 0x0000aa)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive();
        
        const menuText = this.add.text(640, 480, 'VOLVER AL MENÚ', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Efectos de hover para el botón de menú
        menuButton.on('pointerover', () => {
            menuButton.fillColor = 0x0000ff;
            menuText.setFontSize(32);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.fillColor = 0x0000aa;
            menuText.setFontSize(28);
        });
        
        // Acción del botón de menú
        menuButton.on('pointerdown', () => {
            // Guardar puntuación
            saveUserScore(score);
            
            // Volver al menú principal
            this.scene.start('MainMenu');
        });
        
        // Desactivar controles de Mario
        this.mario.isDead = true;
    }
    
}
