import { config } from "./config.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { Nivel1 } from "./scenes/Nivel1/Nivel1.js";
import { Nivel2 } from "./scenes/Nivel2/Nivel2.js";

config.scene = [PreloadScene, GameScene, Nivel1, Nivel2];

new Phaser.Game(config);
