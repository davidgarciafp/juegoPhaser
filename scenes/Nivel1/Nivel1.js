import { createAnimations } from "../../animations/animations.js";
import { createMario } from "../../entities/Mario.js";
import { createGoomba } from "../../entities/Goomba.js";

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

        for (let i = 0; i < 5; i++) {
            suelo = this.floor.create(suelo.x + floorWidth, this.sys.game.config.height - 16, 'floorbricks')
                .setOrigin(0, 0.5)
                .setScale(3)
                .refreshBody();
        }

        this.mario = createMario(this);
        this.goomba = createGoomba(this, 1500, this.sys.game.config.height - 100);

        this.physics.add.collider(this.mario, this.floor);
        this.physics.add.collider(this.mario, this.blocks);

        this.physics.add.collider(this.goomba, this.mario, () => {
            if (!this.mario.isDead) {
                this.mario.isDead = true;
                this.mario.anims.play('mario-dead');
                this.sound.stopAll();
                this.sound.add('dead', { volume: 0.5 }).play();

                setTimeout(() => {
                    this.mario.setVelocityY(-350);
                }, 100);

                setTimeout(() => {
                    this.scene.restart();
                }, 2000);
            }
        });

        this.physics.add.collider(this.goomba, this.floor);
        this.physics.add.collider(this.goomba, this.blocks);

        createAnimations(this);
        this.keys = this.input.keyboard.createCursorKeys();
        this.sound.add('theme', { volume: 0.5, loop: true }).play();
    }

    update() {
        if (this.mario.isDead) return;

        if (this.keys.left.isDown) {
            this.mario.anims.play('mario-walk', true);
            this.mario.x -= 5;
            this.mario.flipX = true;
        } else if (this.keys.right.isDown) {
            this.mario.anims.play('mario-walk', true);
            this.mario.x += 5;
            this.mario.flipX = false;
        } else {
            this.mario.anims.play('mario-idle', true);
        }

        if (this.keys.up.isDown && this.mario.body.touching.down) {
            this.mario.setVelocityY(-500);
            this.sound.add('jump', { volume: 0.1 }).play();
        }
        if (!this.mario.body.touching.down) {
            this.mario.anims.play('mario-jump', true);
        }

        if (this.mario.y >= this.sys.game.config.height) {
            this.mario.isDead = true;
            this.mario.anims.play('mario-dead');
            this.mario.setCollideWorldBounds(false);
            this.sound.stopAll();
            this.sound.add('dead', { volume: 0.5 }).play();

            setTimeout(() => {
                this.mario.setVelocityY(-350);
            }, 100);

            setTimeout(() => {
                this.scene.restart();
            }, 2000);
        }

        this.goomba.anims.play('goomba-walk', true);
    }
}