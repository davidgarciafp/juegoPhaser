export function createGoombas(scene, positions) {
    // Crear un grupo de Goombas
    scene.goombas = scene.physics.add.group({
        bounceX: 1, // Rebota en los bordes
        allowGravity: true, // Asegurar que caigan correctamente
        velocityX: -50, // Se mueven hacia la izquierda
    });

    // Crear Goombas en las posiciones dadas
    positions.forEach(([x, y]) => {
        const goomba = scene.goombas.create(x, y, 'goomba')
            .setSize(14, 16)
            .setOrigin(0, 1)
            .setScale(4);

        goomba.isDead = false; // Propiedad personalizada para gestionar su estado
    });

    return scene.goombas;
}
