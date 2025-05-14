import { config } from "./config.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { Nivel1 } from "./scenes/Nivel1/Nivel1.js";
import { Nivel2 } from "./scenes/Nivel2/Nivel2.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { LoginScene } from "./scenes/LoginScene.js";

// Add global error handler for debugging
window.addEventListener('error', function(event) {
    console.error('Error capturado:', event.error);
});

// Set LoginScene as the first scene to load
config.scene = [LoginScene, MainMenu, PreloadScene, GameScene, Nivel1, Nivel2];

const game = new Phaser.Game(config);

// Añadir un manejador para cuando el navegador cambia de pestaña
window.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // El juego ha perdido el foco
        console.log('Juego en segundo plano');
    } else {
        // El juego ha recuperado el foco
        console.log('Juego en primer plano');
    }
});

// Añadir un manejador para cuando la ventana se redimensiona
window.addEventListener('resize', function() {
    // Actualizar el tamaño del juego si es necesario
    if (game.isBooted) {
        game.scale.resize(window.innerWidth, window.innerHeight);
        console.log('Ventana redimensionada');
    }
});
