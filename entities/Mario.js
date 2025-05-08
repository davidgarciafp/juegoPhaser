export function createMario(scene) {
    // Crear a Mario con colisión de bordes
    const mario = scene.physics.add.sprite(100, 9900, 'mario')
        .setSize(13, 16)    
        .setOrigin(0, 1)
        .setScale(3)
        .setCollideWorldBounds(true)
        .setGravityY(300);

    mario.isDead = false;
    
    return mario;
}
