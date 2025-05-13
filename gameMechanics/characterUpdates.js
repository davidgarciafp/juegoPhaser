export const updateCharacterBehaviors = (scene) => {
    const { mario, goombas } = scene;

    // Inicializar variables de control de caída si no existen
    if (scene.fallDetection === undefined) {
        scene.fallDetection = {
            maxY: 0,              // Máxima altura alcanzada durante un salto
            fallDistance: 0,      // Distancia de caída actual
            maxFallDistance: 800, // Distancia máxima de caída permitida antes de morir
            isTracking: false     // Si estamos actualmente rastreando una caída
        };
    }

    // Movimiento de Mario
    if (mario.isDead) return;


    if (scene.keys.space.isDown && mario.body.touching.down) {
        mario.setVelocityY(-20000);
        scene.sound.add('jump', { volume: 0.1 }).play();
        // Reiniciar el sistema de detección de caída
        scene.fallDetection.maxY = mario.y;
        scene.fallDetection.fallDistance = 0;
        scene.fallDetection.isTracking = true;
    }
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
        // Reiniciar el sistema de detección de caída
        scene.fallDetection.maxY = mario.y;
        scene.fallDetection.fallDistance = 0;
        scene.fallDetection.isTracking = true;
    }
    
    if (!mario.body.touching.down) {
        mario.anims.play('mario-jump', true);
        
        // Actualizar la máxima altura alcanzada durante el salto
        if (mario.y < scene.fallDetection.maxY) {
            scene.fallDetection.maxY = mario.y;
        }
        
        // Si Mario está cayendo (velocidad Y positiva)
        if (mario.body.velocity.y > 0 && scene.fallDetection.isTracking) {
            // Calcular la distancia de caída desde el punto más alto
            scene.fallDetection.fallDistance = mario.y - scene.fallDetection.maxY;
            
            // Si ha caído demasiado, considerarlo como caída en un hueco
            if (scene.fallDetection.fallDistance > scene.fallDetection.maxFallDistance) {
                console.log("Mario ha caído demasiado lejos:", scene.fallDetection.fallDistance);
                killMario(scene, mario, true);
            }
        }
    } else {
        // Si está tocando el suelo, reiniciar el sistema de detección
        scene.fallDetection.isTracking = false;
        scene.fallDetection.fallDistance = 0;
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

    // Verificar si Mario cae fuera de la pantalla
    if (!mario.isDead) {
        const bottomOfScreen = scene.cameras.main.scrollY + scene.cameras.main.height;
        
        if (mario.y > bottomOfScreen) {
            console.log("Mario cayó fuera de la pantalla. Posición Y:", mario.y, "Límite:", bottomOfScreen);
            // Posicionamos a Mario justo en el borde inferior para que sea visible
            mario.y = bottomOfScreen;
            killMario(scene, mario, true);
        }
    }
};

// Función auxiliar para matar a Mario
function killMario(scene, mario, isFallDeath) {
    mario.isDead = true;
    mario.anims.play('mario-dead');
    mario.setCollideWorldBounds(false);
    scene.sound.stopAll();
    scene.sound.add('dead', { volume: 0.5 }).play();
    
    if (isFallDeath) {
        // Si Mario muere por caída, mantenemos una gravedad reducida para un efecto más natural
        mario.body.setGravityY(150); // Reducimos la gravedad a la mitad
        mario.setVelocity(0, 0);
        
        // Guardamos la posición inicial de Mario cuando muere
        const initialY = mario.y;
        
        // Pequeño salto hacia arriba
        mario.setVelocityY(-500);
        
        // Limitamos la caída para que no desaparezca de la pantalla
        scene.time.addEvent({
            delay: 20, // Verificamos cada 20ms
            callback: () => {
                // Si Mario ha caído más de 100 píxeles desde su posición inicial, lo detenemos
                if (mario.y > initialY + 100) {
                    mario.setVelocity(0, 0);
                    mario.body.allowGravity = false;
                }
            },
            repeat: 50 // Verificamos durante 1 segundo (50 * 20ms)
        });
    } else {
        // Comportamiento normal para otras muertes
        setTimeout(() => {
            mario.setVelocityY(-350);
        }, 100);
    }

    setTimeout(() => {
        scene.scene.restart();
    }, 2000);
}
