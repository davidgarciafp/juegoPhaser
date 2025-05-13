import { config } from "./config.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { Nivel1 } from "./scenes/Nivel1/Nivel1.js";
import { Nivel2 } from "./scenes/Nivel2/Nivel2.js";
import { MainMenu } from "./scenes/MainMenu.js";

// Add global error handler for debugging
window.addEventListener('error', function(event) {
    console.error('Error capturado:', event.error);
});

// Set MainMenu as the first scene to load
config.scene = [MainMenu, PreloadScene, GameScene, Nivel1, Nivel2];

new Phaser.Game(config);
