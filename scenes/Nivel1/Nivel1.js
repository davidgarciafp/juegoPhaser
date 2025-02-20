import { createAnimations } from "../../gameMechanics/animations.js";
import { createMario } from "../../entities/Mario.js";
import { createGoomba } from "../../entities/Goomba.js";
import { updateCharacterBehaviors } from "../../gameMechanics/characterUpdates.js";
import { handleCollisions } from "../../gameMechanics/collisions.js";

export class Nivel1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Nivel1' });
    }

    create() {
        this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.5);
        this.add.image(300, 100, 'cloud1').setOrigin(0, 0).setScale(0.3);

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

        for (let i = 0; i < 5; i++) {
            suelo = this.floor.create(suelo.x + floorWidth, this.sys.game.config.height - 16, 'floorbricks')
                .setOrigin(0, 0.5)
                .setScale(3)
                .refreshBody();
        }

        this.mario = createMario(this);
        this.goomba = createGoomba(this, 1500, this.sys.game.config.height - 100);

        handleCollisions(this);

        createAnimations(this);

        this.keys = this.input.keyboard.createCursorKeys();
        this.sound.add('theme', { volume: 0.5, loop: true }).play();
    }

    update() {
        updateCharacterBehaviors(this);
        
    }
}