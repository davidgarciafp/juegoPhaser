export const handleCollisions = (scene) => {
    console.log("collisions");
    
    const { mario, goomba } = scene;

    // Colisión entre Mario y el Goomba
    scene.physics.add.collider(scene.mario, scene.goomba, (mario, goomba) => {
        // Verificar si Mario está tocando el Goomba desde abajo (cuando salta sobre él)
        if (mario.body.bottom <= goomba.body.top + 10 && mario.body.touching.down) {
            // Mario ha aplastado al Goomba
            goomba.isDead = true;
            mario.setVelocityY(-400);
            if (!goomba.anims.isPlaying || goomba.anims.currentAnim.key !== 'goomba-dead') {
                goomba.anims.stop(); // Detener la animación de caminar
                goomba.anims.play('goomba-dead', true); // Reproducir animación de muerte
                goomba.setTint(0xff0000); // Cambiar color a rojo para efectos visuales
                scene.sound.add('goombaDead', { volume: 5 }).play(); // Sonido de Goomba muerto

                // Desactivar las físicas del Goomba para que no siga moviéndose
                goomba.body.enable = false; // Desactivar el cuerpo del Goomba para que no colisione
                goomba.setVelocity(0, 0); // Asegurarse de que no se mueva
                goomba.body.allowGravity = false; // Detener la gravedad en el Goomba
                goomba.setImmovable(true); // Evitar que el Goomba se mueva o reciba colisiones

                // Desactivar el Goomba después de la animación de muerte (500ms para ver la animación)
                setTimeout(() => {
                    goomba.setActive(false).setVisible(false); // Desactivar y ocultar el Goomba muerto
                }, 500); // Desaparece después de 500ms
            }
        } else if(!mario.isDead) {
            // Si Mario no está muerto, se mata al
            // chocar con el Goomba desde cualquier otro lado   

        
                // Si Mario no está saltando sobre el Goomba, se mata al chocar con él
                mario.isDead = true;
                mario.anims.play('mario-dead');
                scene.sound.stopAll();
                scene.sound.add('dead', { volume: 0.5 }).play();

                setTimeout(() => {
                    mario.setVelocityY(-350);
                }, 100);

                setTimeout(() => {
                    scene.scene.restart();
                }, 2000);
            
        }
    });

    // Colisiones entre Mario y el suelo
    scene.physics.add.collider(mario, scene.floor);
    scene.physics.add.collider(mario, scene.blocks);

    // Colisiones entre el Goomba y el suelo
    scene.physics.add.collider(goomba, scene.floor);
    scene.physics.add.collider(goomba, scene.blocks);
};
