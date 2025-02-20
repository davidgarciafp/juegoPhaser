import { Nivel1 } from './Nivel1/Nivel1.js';
import { Nivel2 } from './Nivel2/Nivel2.js';



export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    create() {
        this.scene.start('Nivel1');
        //this.scene.start('Nivel2');

    }

}