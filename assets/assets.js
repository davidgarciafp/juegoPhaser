export const loadAssets1 = (scene) => {
    // Mundo 1
    scene.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    scene.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    scene.load.image('block', 'assets/blocks/overworld/block.png');
    scene.load.image('llama', 'assets/blocks/overworld/llama.png');
    // Spritesheets
    scene.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 18, frameHeight: 16 });
    scene.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', {
        frameWidth: 16, 
        frameHeight: 16
    });

    // Sonidos
    scene.load.audio('dead', 'assets/sound/music/dead.mp3');
    scene.load.audio('jump', 'assets/sound/effects/jump.mp3');
    scene.load.audio('theme', 'assets/sound/music/overworld/theme.mp3');
};

export const loadAssets2 = (scene) => {

};
