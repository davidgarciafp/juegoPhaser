export class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' });
        this.currentUser = null;
        this.isRegistering = false;
        this.apiUrl = 'http://localhost:3000/api'; // URL base de la API
    }

    preload() {
        // Cargar recursos para la pantalla de login
        this.load.image('login-background', 'assets/images/login-background.png');
        this.load.image('input-field', 'assets/images/input-field.png');
        this.load.image('button', 'assets/images/button.png');
    }

    create() {
        console.log("LoginScene: create iniciado");
        
        // Añadir fondo
        try {
            this.add.image(640, 360, 'login-background').setScale(1);
        } catch (error) {
            console.warn("No se pudo cargar el fondo del login:", error);
            this.cameras.main.setBackgroundColor('#000055');
        }
        
        // Título
        this.add.text(640, 100, 'SUPER MARIO BROS', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtítulo
        const subtitleText = this.isRegistering ? 'REGISTRO' : 'INICIAR SESIÓN';
        this.subtitleText = this.add.text(640, 180, subtitleText, {
            fontSize: '36px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Crear campos de entrada
        this.createInputFields();
        
        // Crear botones
        this.createButtons();
        
        // Mensaje de estado (para mostrar errores o mensajes de éxito)
        this.statusMessage = this.add.text(640, 650, '', {
            fontSize: '20px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        console.log("LoginScene: create completado");
    }
    
    createInputFields() {
        // Fondo para el campo de usuario
        const userFieldBg = this.add.rectangle(640, 260, 400, 60, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff);
        
        // Etiqueta para el campo de usuario
        this.add.text(440, 260, 'Usuario:', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        
        // Campo de entrada para el usuario (simulado con texto)
        this.usernameText = this.add.text(640, 260, '', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Hacer el campo de usuario interactivo
        userFieldBg.setInteractive();
        userFieldBg.on('pointerdown', () => {
            this.promptUsername();
        });
        
        // Fondo para el campo de contraseña
        const passwordFieldBg = this.add.rectangle(640, 340, 400, 60, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff);
        
        // Etiqueta para el campo de contraseña
        this.add.text(440, 340, 'Contraseña:', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        
        // Campo de entrada para la contraseña (simulado con asteriscos)
        this.passwordText = this.add.text(640, 340, '', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Hacer el campo de contraseña interactivo
        passwordFieldBg.setInteractive();
        passwordFieldBg.on('pointerdown', () => {
            this.promptPassword();
        });
        
        // Si estamos en modo registro, añadir campo para confirmar contraseña
        if (this.isRegistering) {
            // Fondo para el campo de confirmar contraseña
            const confirmPasswordFieldBg = this.add.rectangle(640, 420, 400, 60, 0x000000, 0.5)
                .setStrokeStyle(2, 0xffffff);
            
            // Etiqueta para el campo de confirmar contraseña
            this.add.text(440, 420, 'Confirmar:', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            
            // Campo de entrada para confirmar contraseña (simulado con asteriscos)
            this.confirmPasswordText = this.add.text(640, 420, '', {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            // Hacer el campo de confirmar contraseña interactivo
            confirmPasswordFieldBg.setInteractive();
            confirmPasswordFieldBg.on('pointerdown', () => {
                this.promptConfirmPassword();
            });
        }
    }
    
    createButtons() {
        // Botón principal (Login o Registro)
        const mainButtonY = this.isRegistering ? 500 : 420;
        const mainButtonText = this.isRegistering ? 'REGISTRARSE' : 'INICIAR SESIÓN';
        
        const mainButton = this.add.rectangle(640, mainButtonY, 300, 60, 0x00aa00)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const mainButtonLabel = this.add.text(640, mainButtonY, mainButtonText, {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Efectos de hover para el botón principal
        mainButton.on('pointerover', () => {
            mainButton.fillColor = 0x00ff00;
            mainButtonLabel.setFontSize(32);
        });
        
        mainButton.on('pointerout', () => {
            mainButton.fillColor = 0x00aa00;
            mainButtonLabel.setFontSize(28);
        });
        
        // Acción del botón principal
        mainButton.on('pointerdown', () => {
            if (this.isRegistering) {
                this.register();
            } else {
                this.login();
            }
        });
        
        // Botón secundario (Cambiar a Registro o Login)
        const secondaryButtonY = this.isRegistering ? 580 : 500;
        const secondaryButtonText = this.isRegistering ? 'VOLVER A LOGIN' : 'CREAR CUENTA';
        
        const secondaryButton = this.add.rectangle(640, secondaryButtonY, 300, 60, 0x0000aa)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const secondaryButtonLabel = this.add.text(640, secondaryButtonY, secondaryButtonText, {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Efectos de hover para el botón secundario
        secondaryButton.on('pointerover', () => {
            secondaryButton.fillColor = 0x0000ff;
            secondaryButtonLabel.setFontSize(32);
        });
        
        secondaryButton.on('pointerout', () => {
            secondaryButton.fillColor = 0x0000aa;
            secondaryButtonLabel.setFontSize(28);
        });
        
        // Acción del botón secundario
        secondaryButton.on('pointerdown', () => {
            this.isRegistering = !this.isRegistering;
            this.scene.restart();
        });
        
        // Botón para jugar sin cuenta
        const guestButtonY = this.isRegistering ? 660 : 580;
        
        const guestButton = this.add.rectangle(640, guestButtonY, 300, 60, 0xaa0000)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const guestButtonLabel = this.add.text(640, guestButtonY, 'JUGAR SIN CUENTA', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Efectos de hover para el botón de invitado
        guestButton.on('pointerover', () => {
            guestButton.fillColor = 0xff0000;
            guestButtonLabel.setFontSize(32);
        });
        
        guestButton.on('pointerout', () => {
            guestButton.fillColor = 0xaa0000;
            guestButtonLabel.setFontSize(28);
        });
        
        // Acción del botón de invitado
        guestButton.on('pointerdown', () => {
            this.playAsGuest();
        });
    }
    
    promptUsername() {
        // En un entorno web real, esto sería un campo de entrada HTML
        // Aquí simulamos con un prompt de JavaScript
        const username = prompt('Introduce tu nombre de usuario:');
        if (username !== null) {
            this.usernameText.setText(username);
        }
    }
    
    promptPassword() {
        // Simulamos con un prompt de JavaScript
        const password = prompt('Introduce tu contraseña:');
        if (password !== null) {
            // Mostrar asteriscos en lugar de la contraseña real
            this.passwordText.setText('*'.repeat(password.length));
            // Guardar la contraseña real en una propiedad no visible
            this.passwordText.realPassword = password;
        }
    }
    
    promptConfirmPassword() {
        // Simulamos con un prompt de JavaScript
        const confirmPassword = prompt('Confirma tu contraseña:');
        if (confirmPassword !== null) {
            // Mostrar asteriscos en lugar de la contraseña real
            this.confirmPasswordText.setText('*'.repeat(confirmPassword.length));
            // Guardar la contraseña real en una propiedad no visible
            this.confirmPasswordText.realPassword = confirmPassword;
        }
    }
    
    async login() {
        const username = this.usernameText.text;
        const password = this.passwordText.realPassword || '';
        
        if (!username || !password) {
            this.showStatusMessage('Por favor, introduce usuario y contraseña.', '#ff0000');
            return;
        }
        
        try {
            // Mostrar mensaje de carga
            this.showStatusMessage('Iniciando sesión...', '#ffffff');
            
            // Hacer petición a la API
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }
            
            // Login exitoso
            this.currentUser = data.user;
            this.saveCurrentUser();
            this.showStatusMessage('Login exitoso. Redirigiendo...', '#00ff00');
            
            // Esperar un momento antes de redirigir
            setTimeout(() => {
                this.scene.start('MainMenu');
            }, 1000);
        } catch (error) {
            console.error('Error en login:', error);
            this.showStatusMessage(error.message || 'Error al iniciar sesión', '#ff0000');
        }
    }
    
    async register() {
        const username = this.usernameText.text;
        const password = this.passwordText.realPassword || '';
        const confirmPassword = this.confirmPasswordText.realPassword || '';
        
        if (!username || !password || !confirmPassword) {
            this.showStatusMessage('Por favor, completa todos los campos.', '#ff0000');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showStatusMessage('Las contraseñas no coinciden.', '#ff0000');
            return;
        }
        
        try {
            // Mostrar mensaje de carga
            this.showStatusMessage('Registrando usuario...', '#ffffff');
            
            // Hacer petición a la API
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }
            
            // Registro exitoso
            this.currentUser = data.user;
            this.saveCurrentUser();
            this.showStatusMessage('Registro exitoso. Redirigiendo...', '#00ff00');
            
            // Esperar un momento antes de redirigir
            setTimeout(() => {
                this.scene.start('MainMenu');
            }, 1000);
        } catch (error) {
            console.error('Error en registro:', error);
            this.showStatusMessage(error.message || 'Error al registrar usuario', '#ff0000');
        }
    }
    
    playAsGuest() {
        // Jugar sin cuenta
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.scene.start('MainMenu');
    }
    
    showStatusMessage(message, color) {
        this.statusMessage.setText(message);
        this.statusMessage.setFill(color);
    }
    
    saveCurrentUser() {
        try {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Error al guardar usuario actual:', error);
        }
    }
}
