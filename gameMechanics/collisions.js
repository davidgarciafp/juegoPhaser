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
    scene.physics.add.collider(goombas, scene.floor);
    scene.physics.add.collider(goombas, scene.blocks);
    
};
