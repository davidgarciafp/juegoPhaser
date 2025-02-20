export function createMario(scene) {
    const mario = scene.physics.add.sprite(50, 500, 'mario')
        .setOrigin(0, 1)
        .setScale(3)
        .setCollideWorldBounds(true)
        .setGravityY(300);
        
        scene.physics.world.setBounds(0, 0, 100000, scene.sys.game.config.height);
        scene.cameras.main.setBounds(0, 0, 100000, scene.sys.game.config.height);
        scene.cameras.main.startFollow(mario);

    return mario;
}
