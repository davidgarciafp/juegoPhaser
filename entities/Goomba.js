export function createGoomba(scene, x, y) {
    const goomba = scene.physics.add.sprite(x, y, 'goomba')
        .setOrigin(0, 1)
        .setScale(3)
        .setCollideWorldBounds(true);

    // Velocidad inicial
    goomba.setVelocityX(-50); // Se mueve hacia la izquierda
    goomba.body.setBounce(1, 0); // Rebota en los bordes
    goomba.body.setSize(goomba.width, goomba.height, false);


    return goomba;
}
