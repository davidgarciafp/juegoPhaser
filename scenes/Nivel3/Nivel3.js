import { handleCollisions } from '../../gameMechanics/collisions.js';
import { updateCharacterBehaviors } from '../../gameMechanics/characterUpdates.js';

export class Nivel3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Nivel3' });
        this.score = 0;
        this.blockGenerationTimer = null;
        this.goombaGenerationTimer = null;
        this.flameGenerationTimer = null;
        this.gameSpeed = 200;
    }

    init(data) {
        this.score = data.score || 0;
    }

    preload() {
        // Cargar imágenes si no se han cargado en PreloadScene
        if (!this.textures.exists('mario')) {
            this.load.spritesheet('mario', 'assets/images/mario-sprites.png', { frameWidth: 32, frameHeight: 32 });
        }
        if (!this.textures.exists('goomba')) {
            this.load.spritesheet('goomba', 'assets/images/goomba-sprites.png', { frameWidth: 32, frameHeight: 32 });
        }
        if (!this.textures.exists('block')) {
            this.load.image('block', 'assets/images/block.png');
        }
        if (!this.textures.exists('floorbrick')) {
            this.load.image('floorbrick', 'assets/images/floorbrick.png');
        }
        if (!this.textures.exists('llama')) {
            this.load.image('llama', 'assets/images/llama.png');
        }
        
        // Cargar sonidos
        this.load.audio('jump', 'assets/sounds/jump.wav');
        this.load.audio('coin', 'assets/sounds/coin.wav');
        this.load.audio('dead', 'assets/sounds/dead.wav');
    }

    create() {
        // Configurar fondo
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000).setOrigin(0);
        
        // Crear grupos
        this.floor = this.physics.add.staticGroup();
        this.blocks = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        this.goombas = this.physics.add.group({
            allowGravity: true
        });
        this.flames = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        
        // Crear suelo
        for (let i = 0; i < 40; i++) {
            this.floor.create(i * 32, this.cameras.main.height - 32, 'floorbrick');
        }
        
        // Crear Mario
        this.mario = this.physics.add.sprite(100, this.cameras.main.height - 100, 'mario');
        this.mario.setCollideWorldBounds(true);
        this.mario.setBounce(0.1);
        this.mario.setSize(24, 32);
        
        // Configurar cámara
        this.cameras.main.startFollow(this.mario, true, 0.05, 0);
        this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, this.cameras.main.height);
        
        // Crear animaciones
        createAnimations(this);
        
        // Configurar controles
        this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });
        
        // Configurar colisiones
        this.setupCollisions();
        
        // Iniciar generación de bloques y enemigos
        this.startBlockGeneration();
        this.startGoombaGeneration();
        this.startFlameGeneration();
        
        // Crear UI
        this.createUI();
    }
    
    setupCollisions() {
        // Colisiones básicas
        handleCollisions(this);
        
        // Colisiones específicas para las llamas
        this.physics.add.collider(this.mario, this.flames, (mario, flame) => {
            if (!mario.isDead) {
                // Mario ha tocado una llama
                mario.isDead = true;
                mario.anims.play('mario-dead');
                this.sound.stopAll();
                this.sound.add('dead', { volume: 0.5 }).play();
                
                setTimeout(() => {
                    mario.setVelocityY(-350);
                }, 100);

                setTimeout(() => {
                    this.scene.restart({ score: 0 });
                }, 2000);
            }
        });
    }
    
    startBlockGeneration() {
        // Generar bloques cada 1-2 segundos
        this.blockGenerationTimer = this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000),
            callback: this.generateBlock,
            callbackScope: this,
            loop: true
        });
    }
    
    startGoombaGeneration() {
        // Generar goombas cada 3-5 segundos
        this.goombaGenerationTimer = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000),
            callback: this.generateGoomba,
            callbackScope: this,
            loop: true
        });
    }
    
    startFlameGeneration() {
        // Generar llamas cada 4-7 segundos (menos frecuente que los bloques)
        this.flameGenerationTimer = this.time.addEvent({
            delay: Phaser.Math.Between(4000, 7000),
            callback: this.generateFlame,
            callbackScope: this,
            loop: true
        });
    }
    
    generateBlock() {
        // Generar 1-3 bloques en posiciones aleatorias
        const numBlocks = Phaser.Math.Between(1, 3);
        
        for (let i = 0; i < numBlocks; i++) {
            const x = this.mario.x + this.cameras.main.width + Phaser.Math.Between(0, 200);
            const y = Phaser.Math.Between(this.cameras.main.height - 300, this.cameras.main.height - 100);
            
            const block = this.blocks.create(x, y, 'block');
            block.setVelocityX(-this.gameSpeed);
            
            // Destruir el bloque cuando salga de la pantalla
            this.time.delayedCall(10000, () => {
                if (block && block.active) {
                    block.destroy();
                }
            });
        }
    }
    
    generateGoomba() {
        // Generar 1-2 goombas en posiciones aleatorias
        const numGoombas = Phaser.Math.Between(1, 2);
        
        for (let i = 0; i < numGoombas; i++) {
            // Posición aleatoria vertical
            const y = Phaser.Math.Between(this.cameras.main.height - 300, this.cameras.main.height - 100);
            const x = this.mario.x + this.cameras.main.width + Phaser.Math.Between(0, 100);
            
            const goomba = this.goombas.create(x, y, 'goomba');
            goomba.setVelocityX(-this.gameSpeed);
            goomba.anims.play('goomba-walk', true);
            
            // Destruir el goomba cuando salga de la pantalla
            this.time.delayedCall(15000, () => {
                if (goomba && goomba.active) {
                    goomba.destroy();
                }
            });
        }
    }
    
    generateFlame() {
        // Generar 1-2 llamas en posiciones aleatorias (menos que los bloques)
        const numFlames = Phaser.Math.Between(1, 2);
        
        for (let i = 0; i < numFlames; i++) {
            // Posición aleatoria vertical
            const y = Phaser.Math.Between(this.cameras.main.height - 300, this.cameras.main.height - 100);
            const x = this.mario.x + this.cameras.main.width + Phaser.Math.Between(0, 150);
            
            const flame = this.flames.create(x, y, 'llama');
            flame.setVelocityX(-this.gameSpeed);
            
            // Añadir efecto de parpadeo a la llama
            this.tweens.add({
                targets: flame,
                alpha: 0.7,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
            
            // Destruir la llama cuando salga de la pantalla
            this.time.delayedCall(10000, () => {
                if (flame && flame.active) {
                    flame.destroy();
                }
            });
        }
    }
    
    createUI() {
        // Crear texto de puntuación
        this.scoreText = this.add.text(16, 16, 'Puntuación: 0', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
    }
    
    update() {
        // Actualizar comportamientos de personajes
        updateCharacterBehaviors(this);
        
        // Actualizar puntuación basada en la distancia recorrida
        this.score += 0.1;
        this.scoreText.setText(`Puntuación: ${Math.floor(this.score)}`);
        
        // Aumentar la velocidad del juego gradualmente
        this.gameSpeed = 200 + Math.floor(this.score / 100) * 10;
        
        // Actualizar velocidad de los objetos existentes
        this.blocks.children.iterate(block => {
            block.setVelocityX(-this.gameSpeed);
        });
        
        this.goombas.children.iterate(goomba => {
            if (!goomba.isDead) {
                goomba.setVelocityX(-this.gameSpeed);
            }
        });
        
        this.flames.children.iterate(flame => {
            flame.setVelocityX(-this.gameSpeed);
        });
    }
}