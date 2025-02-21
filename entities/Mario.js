export function createMario(scene) {
    const mario = scene.physics.add.sprite(50, 500, 'mario')
        .setSize(16, 16)    
        .setOrigin(0, 1)
        .setScale(3)
        .setCollideWorldBounds(true)
        .setGravityY(300);

        mario.isDead = false;
        
        scene.physics.world.setBounds(0, 0, 100000, scene.sys.game.config.height);
        scene.cameras.main.setBounds(0, 0, 100000, scene.sys.game.config.height);
        scene.cameras.main.startFollow(mario);

    return mario;
}
