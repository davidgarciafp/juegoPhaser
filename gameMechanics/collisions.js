export const handleCollisions = (scene) => {
    
    const { mario, goombas } = scene;

    // Colisión entre Mario y el Goomba
    scene.physics.add.collider(scene.mario, scene.goombas, (mario, goomba) => {
        // Verificar si Mario está tocando el Goomba desde abajo (cuando salta sobre él)
        goomba.setVelocityX(0);
        if (mario.body.bottom <= goomba.body.top + 10 && mario.body.touching.down) {
            // Mario ha aplastado al Goomba
            goomba.isDead = true;
            mario.setVelocityY(-400);
            goomba.anims.stop();
            goomba.anims.play('goomba-dead', true);
            goomba.setTint(0x5784FF);
            goomba.body.enable = false;
            goomba.body.allowGravity = false;
            goomba.setImmovable(true);
            setTimeout(() => {
                goomba.destroy();
            }, 1000);
        } else if(!mario.isDead) {  
            // Mario ha sido golpeado por el Goomba
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

    // Colisiones entre Mario y el suelo - estas colisiones son normales y no deben causar muerte
    scene.physics.add.collider(mario, scene.floor);
    scene.physics.add.collider(mario, scene.blocks);

    // Colisiones entre el Goomba y el suelo
    scene.physics.add.collider(goombas, scene.floor);
    scene.physics.add.collider(goombas, scene.blocks);
    
    // Configuramos un temporizador para habilitar la detección de caída después de un tiempo
    scene.fallDetectionEnabled = false;
    setTimeout(() => {
        scene.fallDetectionEnabled = true;
    }, 2000); // Damos más tiempo para que todo se inicialice correctamente
    
    // Verificar si Mario cae fuera de la pantalla
    scene.events.on('update', () => {
        // Solo verificar la caída si la detección está habilitada y Mario no está muerto
        if (scene.fallDetectionEnabled && !mario.isDead) {
            const bottomOfScreen = scene.cameras.main.scrollY + scene.cameras.main.height + 100; // Añadimos margen extra
            
            // Verificar si Mario está por debajo del límite inferior de la pantalla
            if (mario.y > bottomOfScreen) {
                console.log("Mario cayó fuera de la pantalla. Posición Y:", mario.y, "Límite:", bottomOfScreen);
                mario.isDead = true;
                mario.anims.play('mario-dead');
                scene.sound.stopAll();
                scene.sound.add('dead', { volume: 0.5 }).play();
                
                setTimeout(() => {
                    scene.scene.restart();
                }, 2000);
            }
        }
    });
};
