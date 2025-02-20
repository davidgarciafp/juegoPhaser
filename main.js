import { config } from "./config.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { GameScene } from "./scenes/GameScene.js";

config.scene = [PreloadScene, GameScene];

new Phaser.Game(config);
