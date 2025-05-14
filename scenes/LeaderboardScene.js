export class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.apiUrl = 'http://localhost:3000/api';
        this.leaderboardData = [];
        this.isLoading = true;
        this.errorMessage = '';
    }

    preload() {
        // Cargar recursos para la pantalla de clasificación
        this.load.image('leaderboard-background', 'assets/images/menu-background.png');
    }

    create() {
        console.log("LeaderboardScene: create iniciado");
        
        // Añadir fondo
        try {
            this.add.image(640, 360, 'leaderboard-background').setScale(1);
        } catch (error) {
            console.warn("No se pudo cargar el fondo de la clasificación:", error);
            this.cameras.main.setBackgroundColor('#000055');
        }
        
        // Título
        this.add.text(640, 80, 'CLASIFICACIÓN', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Mensaje de carga
        this.loadingText = this.add.text(640, 360, 'Cargando clasificación...', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Botón para volver al menú
        const backButton = this.add.rectangle(640, 650, 300, 60, 0xaa0000)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const backButtonLabel = this.add.text(640, 650, 'VOLVER AL MENÚ', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Efectos de hover para el botón
        backButton.on('pointerover', () => {
            backButton.fillColor = 0xff0000;
            backButtonLabel.setFontSize(32);
        });
        
        backButton.on('pointerout', () => {
            backButton.fillColor = 0xaa0000;
            backButtonLabel.setFontSize(28);
        });
        
        // Acción del botón
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        // Cargar datos de la clasificación
        this.loadLeaderboardData();
        
        console.log("LeaderboardScene: create completado");
    }
    
    async loadLeaderboardData() {
        try {
            // Intentar obtener la clasificación del servidor
            const response = await fetch(`${this.apiUrl}/leaderboard`);
            
            if (!response.ok) {
                throw new Error('Error al obtener la clasificación');
            }
            
            const data = await response.json();
            this.leaderboardData = data.leaderboard;
            this.isLoading = false;
            
            // Mostrar la clasificación
            this.displayLeaderboard();
        } catch (error) {
            console.error('Error al cargar clasificación:', error);
            this.isLoading = false;
            this.errorMessage = 'No se pudo cargar la clasificación. Intenta más tarde.';
            
            // Mostrar mensaje de error
            this.loadingText.setText(this.errorMessage);
            
            // Intentar cargar datos locales como fallback
            this.loadLocalLeaderboard();
        }
    }
    
    loadLocalLeaderboard() {
        try {
            // Intentar obtener usuarios del localStorage
            const usersJson = localStorage.getItem('users');
            if (!usersJson) {
                return;
            }
            
            const users = JSON.parse(usersJson);
            
            // Procesar los datos para obtener la mejor puntuación de cada usuario
            this.leaderboardData = users.map(user => {
                const bestScore = user.scores && user.scores.length > 0 ? Math.max(...user.scores) : 0;
                return {
                    username: user.username,
                    bestScore: bestScore
                };
            });
            
            // Ordenar por puntuación (de mayor a menor)
            this.leaderboardData.sort((a, b) => b.bestScore - a.bestScore);
            
            // Mostrar la clasificación
            this.displayLeaderboard();
        } catch (error) {
            console.error('Error al cargar clasificación local:', error);
        }
    }
    
    displayLeaderboard() {
        // Eliminar el mensaje de carga
        this.loadingText.destroy();
        
        // Si no hay datos, mostrar un mensaje
        if (!this.leaderboardData || this.leaderboardData.length === 0) {
            this.add.text(640, 360, 'No hay datos de clasificación disponibles', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 3
            }).setOrigin(0.5);
            return;
        }
        
        // Crear un panel para la clasificación
        const panelBg = this.add.rectangle(640, 360, 600, 400, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffffff);
        
        // Encabezados de la tabla
        this.add.text(340, 180, 'POSICIÓN', {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        
        this.add.text(500, 180, 'JUGADOR', {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        
        this.add.text(800, 180, 'PUNTUACIÓN', {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
        
        // Mostrar los primeros 10 jugadores (o menos si no hay suficientes)
        const maxEntries = Math.min(10, this.leaderboardData.length);
        
        for (let i = 0; i < maxEntries; i++) {
            const entry = this.leaderboardData[i];
            const yPos = 230 + (i * 40);
            
            // Color según la posición
            let textColor = '#ffffff';
            if (i === 0) textColor = '#ffd700'; // Oro
            else if (i === 1) textColor = '#c0c0c0'; // Plata
            else if (i === 2) textColor = '#cd7f32'; // Bronce
            
            // Posición
            this.add.text(380, yPos, `${i + 1}`, {
                fontSize: '22px',
                fill: textColor,
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5, 0.5);
            
            // Nombre de usuario
            this.add.text(500, yPos, entry.username, {
                fontSize: '22px',
                fill: textColor,
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0, 0.5);
            
            // Puntuación
            this.add.text(800, yPos, `${entry.bestScore}`, {
                fontSize: '22px',
                fill: textColor,
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0, 0.5);
        }
    }
}