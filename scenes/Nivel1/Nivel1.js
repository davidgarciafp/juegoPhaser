import { createAnimations } from "../../gameMechanics/animations.js";
import { createMario } from "../../entities/Mario.js";
import { createGoombas } from "../../entities/Goomba.js";
import { updateCharacterBehaviors } from "../../gameMechanics/characterUpdates.js";
import { handleCollisions } from "../../gameMechanics/collisions.js";

export class Nivel1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Nivel1' });

    }

    create() {

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
        
        // Dividir el mundo en secciones verticales para una distribución más regular
        const totalSections = 40; // Número de secciones verticales
        const sectionHeight = (worldHeight - 1000) / totalSections;
        
        // Crear bloques en cada sección
        for (let section = 0; section < totalSections; section++) {
            const sectionY = worldHeight - 300 - (section * sectionHeight);
            
            // Número de plataformas en esta sección
            const platformsInSection = Phaser.Math.Between(4, 8);
            
            for (let p = 0; p < platformsInSection; p++) {
                // Posición X aleatoria para la plataforma
                const platformX = Phaser.Math.Between(100, 1100 - scaledBlockWidth * 3);
                
                // Longitud de la plataforma
                const platformLength = Phaser.Math.Between(2, 4);
                
                // Pequeña variación en Y para que no todas las plataformas estén exactamente a la misma altura
                const yVariation = Phaser.Math.Between(-30, 30);
                
                // Crear la plataforma
                for (let j = 0; j < platformLength; j++) {
                    this.block = this.blocks.create(
                        platformX + (j * scaledBlockWidth), 
                        sectionY + yVariation, 
                        'block'
                    )
                    .setOrigin(0, 0)
                    .setScale(blockScale)
                    .refreshBody();
                }
            }
        }
        
        // Crear una ruta principal de subida en zigzag
        let zigzagX = 200;
        let zigzagY = worldHeight - 300;
        const zigzagSteps = 50;
        const zigzagHeight = (worldHeight - 800) / zigzagSteps;
        
        for (let i = 0; i < zigzagSteps; i++) {
            // Crear una plataforma en cada paso del zigzag
            const platformLength = Phaser.Math.Between(2, 4);
            
            for (let j = 0; j < platformLength; j++) {
                this.block = this.blocks.create(
                    zigzagX + (j * scaledBlockWidth), 
                    zigzagY, 
                    'block'
                )
                .setOrigin(0, 0)
                .setScale(blockScale)
                .refreshBody();
            }
            
            // Mover hacia arriba
            zigzagY -= zigzagHeight;
            
            // Alternar entre izquierda y derecha
            if (i % 2 === 0) {
                zigzagX = Phaser.Math.Between(700, 1000 - platformLength * scaledBlockWidth);
            } else {
                zigzagX = Phaser.Math.Between(100, 400);
            }
        }
        
        // Crear algunas plataformas adicionales cerca del suelo para facilitar el inicio
        for (let i = 0; i < 15; i++) {
            const platformX = Phaser.Math.Between(100, 1100 - scaledBlockWidth * 3);
            const platformY = worldHeight - 150 - Phaser.Math.Between(50, 200);
            const platformLength = Phaser.Math.Between(2, 4);
            
            for (let j = 0; j < platformLength; j++) {
                this.block = this.blocks.create(
                    platformX + (j * scaledBlockWidth), 
                    platformY, 
                    'block'
                )
                .setOrigin(0, 0)
                .setScale(blockScale)
                .refreshBody();
            }
        }
        
        // Crear algunas plataformas largas como áreas de descanso
        for (let i = 0; i < 10; i++) {
            const restY = worldHeight - 1000 - (i * 900);
            const restX = Phaser.Math.Between(200, 800);
            const restLength = Phaser.Math.Between(5, 8);
            
            for (let j = 0; j < restLength; j++) {
                this.block = this.blocks.create(
                    restX + (j * scaledBlockWidth), 
                    restY, 
                    'block'
                )
                .setOrigin(0, 0)
                .setScale(blockScale)
                .refreshBody();
            }
        }
        

        // Crear a Mario y configurarlo para que colisione con los bordes del mundo
        this.mario = createMario(this);
        this.mario.setCollideWorldBounds(true);


        this.goombas = this.physics.add.group();

        this.goombas = createGoombas(this, [
            [500, worldHeight  - 100],
            [800, worldHeight  - 100],
            [1200, worldHeight  - 100]
        ]);

        handleCollisions(this);

        createAnimations(this);

        
        this.cameras.main.startFollow(this.mario, true, 0, 1); 


        this.keys = this.input.keyboard.createCursorKeys();
        this.sound.add('theme', { volume: 0.5, loop: true }).play();

        this.minY = worldHeight - 100; // Posición inicial de Mario
        this.isMovingUp = false;
        
        // Configuración para el contador de progreso
        this.startY = worldHeight - 100; // Posición inicial (parte inferior)
        this.endY = 500; // Posición final (parte superior)
        this.totalDistance = this.startY - this.endY; // Distancia total a recorrer
        
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
    }

    update() {
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


    }
}
