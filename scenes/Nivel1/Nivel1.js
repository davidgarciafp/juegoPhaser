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
        const numberOfClouds = 100000; // Número de nubes
        const cloudWidth = 150; // Ancho de la nube
        let lastX = 0; // Coordenada X inicial para la primera nube

        // Calcular la distancia mínima entre las nubes
        const minDistance = cloudWidth + 50;  // El 50 es la separación que deseas entre nubes

        for (let i = 0; i < numberOfClouds; i++) {
            // Calcular la posición aleatoria Y para cada nube
            const randomY = Phaser.Math.Between(50, 400);
            
            // Calcular la posición X de la nube con separación suficiente respecto a la anterior
            const randomX = lastX + Phaser.Math.Between(minDistance, minDistance + 100);

            // Si la última nube se coloca fuera de la pantalla, se ajusta para que no se pase
            if (randomX + cloudWidth > 100000) {
                break;
            }

            // Crear la nube en la posición calculada
            const cloud = this.add.image(randomX, randomY, 'cloud1').setOrigin(0, 0).setScale(0.5);

            // Añadir movimiento continuo hacia la izquierda
            this.tweens.add({
                targets: cloud,
                x: -cloud.displayWidth,  // Mover la nube fuera de la pantalla por la izquierda
                duration: Phaser.Math.Between(90000, 100000),  // Duración aleatoria para cada nube
                ease: 'Linear',
                repeat: -1,  // Repetir indefinidamente
            });

            // Actualizar la posición para la siguiente nube
            lastX = cloud.x + cloud.displayWidth;
        }





        this.floor = this.physics.add.staticGroup();
        let suelo = this.floor.create(0, this.sys.game.config.height - 16, 'floorbricks').setOrigin(0, 0.5).setScale(3).refreshBody();
        let floorWidth = suelo.displayWidth;
        let floorHeight = suelo.displayHeight;
        suelo = this.floor.create(suelo.x + floorWidth + 100, this.sys.game.config.height - 16, 'floorbricks')
            .setOrigin(0, 0.5)
            .setScale(3)
            .refreshBody();

        suelo = this.floor.create(suelo.x + floorWidth, this.sys.game.config.height - 16, 'floorbricks')
            .setOrigin(0, 0.5)
            .setScale(3)
            .refreshBody();

        const blockHeight = 16; 
        this.blocks = this.physics.add.staticGroup();
        this.block = this.blocks.create(suelo.x + floorWidth / 2, this.sys.game.config.height - floorHeight - blockHeight, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block = this.blocks.create(suelo.x + floorWidth + this.block.displayWidth + 200, this.sys.game.config.height - floorHeight - blockHeight, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block = this.blocks.create(suelo.x + floorWidth/2 + this.block.displayWidth + 125,500, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block2 = this.blocks.create(this.block.x + this.block.displayWidth, 500, 'block') // Usa el `x` del bloque anterior
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block3 = this.blocks.create(this.block2.x + this.block2.displayWidth, 500, 'block') // Usa el `x` del bloque anterior
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();

        

        for (let i = 0; i < 5; i++) {
            suelo = this.floor.create(suelo.x + floorWidth, this.sys.game.config.height - 16, 'floorbricks')
                .setOrigin(0, 0.5)
                .setScale(3)
                .refreshBody();
        }

        this.mario = createMario(this);

        this.goombas = this.physics.add.group();

        this.goombas = createGoombas(this, [
            [500, this.sys.game.config.height - 100],
            [800, this.sys.game.config.height - 100],
            [1200, this.sys.game.config.height - 100]
        ]);

        handleCollisions(this);

        createAnimations(this);

        this.physics.world.setBounds(0, 0, 100000, this.sys.game.config.height);
        this.cameras.main.setBounds(0, 0, 100000, this.sys.game.config.height);
        this.cameras.main.startFollow(this.mario, true, 0.1, 0.1);

        this.keys = this.input.keyboard.createCursorKeys();
        this.sound.add('theme', { volume: 0.5, loop: true }).play();
    }

    update() {
        updateCharacterBehaviors(this);
        if (this.keys.left.isDown) {
            // Si Mario se mueve a la izquierda, detén el movimiento de la cámara
            this.cameras.main.stopFollow();
        } else {
            // Si Mario no se mueve a la izquierda, la cámara sigue a Mario
            this.cameras.main.startFollow(this.mario, true, 0.1, 0.1);
        }

    }
}