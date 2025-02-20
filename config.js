export const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#049cd8',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 },
            debug: true
        },
    },
    scene: [] // Se añadirán las escenas en main.js
};