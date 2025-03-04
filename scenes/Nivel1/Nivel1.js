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

        this.floor = this.physics.add.staticGroup();
        let suelo = this.floor.create(0, worldHeight  - 16, 'floorbricks').setOrigin(0, 0.5).setScale(3).refreshBody();
        let floorWidth = suelo.displayWidth;
        let floorHeight = suelo.displayHeight;
        suelo = this.floor.create(suelo.x + floorWidth + 100, worldHeight  - 16, 'floorbricks')
            .setOrigin(0, 0.5)
            .setScale(3)
            .refreshBody();

        suelo = this.floor.create(suelo.x + floorWidth, worldHeight  - 16, 'floorbricks')
            .setOrigin(0, 0.5)
            .setScale(3)
            .refreshBody();

        const blockHeight = 16; 
        this.blocks = this.physics.add.staticGroup();
        this.block = this.blocks.create(suelo.x + floorWidth / 2,worldHeight  - floorHeight - blockHeight, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block = this.blocks.create(suelo.x + floorWidth/2 + worldHeight  + 125,500, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block = this.blocks.create(suelo.x + floorWidth/2, worldHeight -300, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block = this.blocks.create(suelo.x + floorWidth/2 + this.block.displayWidth + 125,worldHeight -400, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();
        this.block = this.blocks.create(suelo.x + floorWidth/2 + this.block.displayWidth + 125,worldHeight -600, 'block')
            .setOrigin(0, 0)
            .setScale(3)
            .refreshBody();

        

        for (let i = 0; i < 5; i++) {
            suelo = this.floor.create(suelo.x + floorWidth, worldHeight  - 16, 'floorbricks')
                .setOrigin(0, 0.5)
                .setScale(3)
                .refreshBody();
        }

        this.mario = createMario(this);


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

        this.minY = 9800;
        this.isMovingUp = false;
    }

    update() {
        updateCharacterBehaviors(this);
        if (this.mario.y < this.minY) {
            this.cameras.main.startFollow(this.mario, true, 0, 1); 
            this.minY = this.mario.y;
            this.isMovingUp = true; 
        }

        if (this.mario.y > this.minY && this.isMovingUp) {
            this.cameras.main.stopFollow();
            this.isMovingUp = false;
        }



    }
}