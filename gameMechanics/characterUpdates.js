export const updateCharacterBehaviors = (scene) => {
    const { mario, goombas } = scene;

    // Movimiento de Mario
    if (mario.isDead) return;

    if (scene.keys.left.isDown) {
        mario.setVelocityX(-150);
        mario.anims.play('mario-walk', true);
        mario.flipX = true;
        if (scene.keys.shift.isDown && mario.body.touching.down) {
            mario.setVelocityX(-250);
        }
    } else if (scene.keys.right.isDown) {
        mario.setVelocityX(150);
        mario.anims.play('mario-walk', true);
        mario.flipX = false;
        if (scene.keys.shift.isDown && mario.body.touching.down) {
            mario.setVelocityX(250);
        }
    } else {
        mario.setVelocityX(0);
        mario.anims.play('mario-idle', true);
    }

    if (scene.keys.up.isDown && mario.body.touching.down) {
        mario.setVelocityY(-700);
        scene.sound.add('jump', { volume: 0.1 }).play();
    }
    if (!mario.body.touching.down) {
        mario.anims.play('mario-jump', true);
    }

    if (mario.y >= 100000) {
        mario.isDead = true;
        mario.anims.play('mario-dead');
        mario.setCollideWorldBounds(false);
        scene.sound.stopAll();
        scene.sound.add('dead', { volume: 0.5 }).play();

        setTimeout(() => {
            mario.setVelocityY(-700);
        }, 100);

        setTimeout(() => {
            scene.scene.restart();
        }, 2000);
    }

    // Comportamiento especial de Mario con shift + flechas
    if (scene.keys.up.isDown && scene.keys.shift.isDown && scene.keys.right.isDown) {
        mario.setVelocityX(250);
    }
    if (scene.keys.up.isDown && scene.keys.shift.isDown && scene.keys.left.isDown) {
        mario.setVelocityX(-250);
    }

    
    // Movimiento de Goomba
    goombas.children.iterate((goomba) => {
        if (!goomba.isDead) {
            goomba.anims.play('goomba-walk', true);
        }
    });


    if (mario.x <= scene.cameras.main.scrollX) {
        // Si Mario está a la izquierda de la cámara, muere
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
};
