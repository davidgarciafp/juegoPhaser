export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {

        //mundo1
        this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
        this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
        this.load.image('block', 'assets/blocks/overworld/block.png');
        

        
        
        this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 18, frameHeight: 16 });
        this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', {
            frameWidth: 16, 
            frameHeight: 16
        });
        
        
        
        this.load.audio('dead', 'assets/sound/music/dead.mp3');
        this.load.audio('jump', 'assets/sound/effects/jump.mp3');
        this.load.audio('theme', 'assets/sound/music/overworld/theme.mp3');
    }

    create() {
        this.scene.start('GameScene'); // Pasa a la escena del juego
    }
}
