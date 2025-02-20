import {loadAssets1, loadAssets2} from '../assets/assets.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        loadAssets1(this); // Carga los assets del mundo 1
        //loadAssets2(this); // Carga los assets del mundo 2
    }

    create() {
        this.scene.start('GameScene'); // Pasa a la escena del juego
    }
}
