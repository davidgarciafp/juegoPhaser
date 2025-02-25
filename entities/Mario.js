export function createMario(scene) {
    const mario = scene.physics.add.sprite(100, scene.sys.game.config.height -200, 'mario')
        .setSize(13, 16)    
        .setOrigin(0, 1)
        .setScale(3)
        .setCollideWorldBounds(true)
        .setGravityY(300);

        mario.isDead = false;
        
    return mario;
}
