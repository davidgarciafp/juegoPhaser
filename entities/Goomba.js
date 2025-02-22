export function createGoomba(scene, x, y) {
    const goomba = scene.physics.add.sprite(x, y, 'goomba')
        .setSize(14, 16)    
        .setOrigin(0, 1)
        .setScale(4)
        .setCollideWorldBounds(true);

    // Velocidad inicial
    goomba.setVelocityX(-50); // Se mueve hacia la izquierda
    goomba.body.setBounce(1, 0); // Rebota en los bordes


    return goomba;
}
