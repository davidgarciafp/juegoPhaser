import { loadAssets1 } from '../assets/assets.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        this.currentUser = null;
        this.apiUrl = 'http://localhost:3000/api';
    }

    preload() {
        // Mostrar texto de carga
        const loadingText = this.add.text(640, 360, 'Cargando...', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Mostrar una barra de carga
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff // blanco
            }
        });
        
        this.load.on('progress', (percent) => {
            loadingBar.fillRect(240, 400, 800 * percent, 30);
            loadingText.setText(`Cargando... ${Math.floor(percent * 100)}%`);
        });
        
        this.load.on('complete', () => {
            loadingBar.destroy();
            loadingText.destroy();
        });
        
        // Cargar recursos para el menú
        this.load.image('menu-background', 'assets/images/menu-background.png');
        this.load.image('title', 'assets/images/title.png');
        
        // Cargar recursos del juego usando la función loadAssets1
        loadAssets1(this);
        
        // Cargar música del menú
        this.load.audio('menu-music', 'assets/sounds/menu-music.mp3');
    }

    async create() {
        console.log("MainMenu: create iniciado");
        
        // Cargar el usuario actual
        await this.loadCurrentUser();
        
        // Añadir fondo del menú (o un color de fondo si la imagen no está disponible)
        try {
            this.add.image(640, 360, 'menu-background').setScale(1);
        } catch (error) {
            console.warn("No se pudo cargar el fondo del menú:", error);
            this.cameras.main.setBackgroundColor('#000088');
        }
        
        // Añadir título del juego
        try {
            this.add.image(640, 150, 'title').setScale(0.8);
        } catch (error) {
            console.warn("No se pudo cargar el título:", error);
            this.add.text(640, 150, 'SUPER MARIO BROS', {
                fontSize: '48px',
                fill: '#fff',
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 6
            }).setOrigin(0.5);
        }
        
        // Mostrar información del usuario
        this.displayUserInfo();
        
        // Reproducir música del menú
        try {
            // Detener cualquier música que esté sonando
            this.sound.stopAll();
            
            // Reproducir la música del menú
            this.sound.add('menu-music', { volume: 0.5, loop: true }).play();
        } catch (error) {
            console.warn("No se pudo reproducir la música del menú:", error);
            // Intentar reproducir la música del tema como alternativa
            try {
                this.sound.add('theme', { volume: 0.3, loop: true }).play();
            } catch (innerError) {
                console.warn("Tampoco se pudo reproducir la música alternativa:", innerError);
            }
        }
        
        // Crear un botón para iniciar el juego
        const startButton = this.add.rectangle(640, 400, 300, 100, 0x00aa00);
        const startText = this.add.text(640, 400, 'INICIAR JUEGO', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Hacer el botón interactivo
        startButton.setInteractive();
        startButton.on('pointerover', () => {
            startButton.fillColor = 0x00ff00;
            startText.setFontSize(36);
        });
        startButton.on('pointerout', () => {
            startButton.fillColor = 0x00aa00;
            startText.setFontSize(32);
        });
        startButton.on('pointerdown', () => {
            console.log("Iniciando Nivel1...");
            
            // Detener la música antes de cambiar de escena
            this.sound.stopAll();
            
            // Limpiar la escena actual
            this.cleanupScene();
            
            // Iniciar el Nivel1 con un pequeño retraso para asegurar que todo se ha limpiado
            this.time.delayedCall(100, () => {
                this.scene.start('Nivel1');
            });
        });
        
        // Añadir texto de instrucciones
        this.add.text(640, 550, 'Usa las flechas para moverte', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.add.text(640, 600, 'Flecha arriba para saltar', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.add.text(640, 650, 'Shift + flechas para correr', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Añadir botón para cerrar sesión
        if (this.currentUser) {
            const logoutButton = this.add.rectangle(1180, 50, 180, 50, 0xaa0000)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive();
            
            const logoutText = this.add.text(1180, 50, 'CERRAR SESIÓN', {
                fontSize: '18px',
                fill: '#fff',
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            // Efectos de hover para el botón de cerrar sesión
            logoutButton.on('pointerover', () => {
                logoutButton.fillColor = 0xff0000;
                logoutText.setFontSize(20);
            });
            
            logoutButton.on('pointerout', () => {
                logoutButton.fillColor = 0xaa0000;
                logoutText.setFontSize(18);
            });
            
            // Acción del botón de cerrar sesión
            logoutButton.on('pointerdown', () => {
                this.logout();
            });
        }
        
        console.log("MainMenu: create completado");
    }
    
    displayUserInfo() {
        // Mostrar información del usuario si hay uno conectado
        if (this.currentUser) {
            // Fondo para la información del usuario
            this.add.rectangle(200, 50, 300, 70, 0x000000, 0.7)
                .setStrokeStyle(2, 0xffffff);
            
            // Nombre de usuario
            this.add.text(200, 35, `Usuario: ${this.currentUser.username}`, {
                fontSize: '20px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5, 0.5);
            
            // Mejor puntuación (si existe)
            let bestScore = 0;
            if (this.currentUser.scores && this.currentUser.scores.length > 0) {
                bestScore = Math.max(...this.currentUser.scores);
            }
            
            this.add.text(200, 65, `Mejor puntuación: ${bestScore}`, {
                fontSize: '20px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5, 0.5);
        } else {
            // Mensaje para usuario invitado
            this.add.rectangle(200, 50, 300, 50, 0x000000, 0.7)
                .setStrokeStyle(2, 0xffffff);
            
            this.add.text(200, 50, 'Jugando como invitado', {
                fontSize: '20px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5, 0.5);
        }
    }
    
    async loadCurrentUser() {
        try {
            const userJson = localStorage.getItem('currentUser');
            if (!userJson) {
                this.currentUser = null;
                return;
            }
            
            this.currentUser = JSON.parse(userJson);
            
            // Si hay un usuario conectado, obtener sus puntuaciones actualizadas
            if (this.currentUser && this.currentUser._id) {
                const response = await fetch(`${this.apiUrl}/scores/${this.currentUser._id}`);
                
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser.scores = data.scores;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                }
            }
        } catch (error) {
            console.error('Error al cargar usuario actual:', error);
            this.currentUser = null;
        }
    }
    
    logout() {
        // Eliminar el usuario actual
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Volver a la pantalla de login
        this.scene.start('LoginScene');
    }
    
    // Método para limpiar la escena antes de cambiar a otra
    cleanupScene() {
        // Detener todos los sonidos
        this.sound.stopAll();
        
        // Detener todas las animaciones en curso
        this.anims.pauseAll();
        
        // Verificar si hay una escena Nivel1 activa y reiniciarla
        if (this.scene.get('Nivel1')) {
            try {
                this.scene.get('Nivel1').resetVariables();
            } catch (error) {
                console.warn("No se pudo reiniciar variables de Nivel1:", error);
            }
        }
        
        console.log("MainMenu: cleanupScene completado");
    }
    
    // Método que se ejecuta cuando se detiene la escena
    shutdown() {
        // Limpiar recursos
        this.sound.stopAll();
        this.anims.pauseAll();
        
        console.log("MainMenu: shutdown completado");
    }
}
