export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    create() {
        this.scene.start('Nivel1');
        //this.scene.start('Nivel2');

    }

}