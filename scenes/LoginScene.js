export class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' });
        this.currentUser = null;
        this.isRegistering = false;
        this.isAdminLogin = false;
        this.apiUrl = 'http://localhost:3000/api'; // URL base de la API
        this.activeInput = null; // Para rastrear qué campo está activo
    }

    preload() {
        // Cargar recursos para la pantalla de login
        this.load.image('login-background', 'assets/Logo.png');
        this.load.image('input-field', 'assets/images/input-field.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('admin-icon', 'assets/hud/gear.png');
    }

    create() {
        console.log("LoginScene: create iniciado");
        
        // Añadir fondo
        try {
            this.add.image(240, 360, 'login-background').setScale(1);
        } catch (error) {
            console.warn("No se pudo cargar el fondo del login:", error);
            this.cameras.main.setBackgroundColor('#000055');
        }
        
        // Título
        const titleText = this.isAdminLogin ? 'ADMINISTRACIÓN' : 'JUMP OR DIE';
        this.add.text(640, 100, titleText, {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtítulo
        let subtitleText = 'INICIAR SESIÓN';
        if (this.isRegistering) subtitleText = 'REGISTRO';
        if (this.isAdminLogin) subtitleText = 'ACCESO ADMINISTRADOR';
        
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
        
        // Verificar conexión con el servidor
        this.checkServerConnection();
        
        // Botón de administración (solo visible en la pantalla de login normal)
        if (!this.isRegistering && !this.isAdminLogin) {
            this.createAdminButton();
        }
        
        // Configurar entrada de teclado
        this.setupKeyboardInput();
        
        console.log("LoginScene: create completado");
    }
    
    setupKeyboardInput() {
        // Configurar el evento de teclado para capturar la entrada
        this.input.keyboard.on('keydown', (event) => {
            // Solo procesar si hay un campo activo
            if (this.activeInput) {
                if (event.keyCode === 8) {
                    // Tecla de retroceso (borrar)
                    this.handleBackspace();
                } else if (event.keyCode === 13) {
                    // Tecla Enter (confirmar)
                    this.handleEnter();
                } else if (event.keyCode === 9) {
                    // Tecla Tab (cambiar campo)
                    event.preventDefault();
                    this.handleTab();
                } else if (event.keyCode >= 32 && event.keyCode <= 126) {
                    // Caracteres imprimibles
                    this.handleCharacter(event.key);
                }
            }
        });
    }
    
    handleBackspace() {
        if (this.activeInput === this.usernameInput) {
            // Borrar último carácter del nombre de usuario
            if (this.usernameText.text.length > 0) {
                this.usernameText.setText(this.usernameText.text.slice(0, -1));
            }
        } else if (this.activeInput === this.passwordInput || this.activeInput === this.confirmPasswordInput) {
            // Borrar último carácter de la contraseña
            const inputField = this.activeInput === this.passwordInput ? this.passwordInput : this.confirmPasswordInput;
            const textField = this.activeInput === this.passwordInput ? this.passwordText : this.confirmPasswordText;
            
            if (inputField.realValue && inputField.realValue.length > 0) {
                inputField.realValue = inputField.realValue.slice(0, -1);
                textField.setText('*'.repeat(inputField.realValue.length));
            }
        }
    }
    
    handleEnter() {
        // Cambiar al siguiente campo o enviar el formulario
        if (this.activeInput === this.usernameInput) {
            this.setActiveInput(this.passwordInput);
        } else if (this.activeInput === this.passwordInput) {
            if (this.isRegistering) {
                this.setActiveInput(this.confirmPasswordInput);
            } else {
                // Enviar formulario de login
                if (this.isAdminLogin) {
                    this.adminLogin();
                } else {
                    this.login();
                }
            }
        } else if (this.activeInput === this.confirmPasswordInput) {
            // Enviar formulario de registro
            this.register();
        }
    }
    
    handleTab() {
        // Cambiar al siguiente campo
        if (this.activeInput === this.usernameInput) {
            this.setActiveInput(this.passwordInput);
        } else if (this.activeInput === this.passwordInput) {
            if (this.isRegistering) {
                this.setActiveInput(this.confirmPasswordInput);
            } else {
                this.setActiveInput(this.usernameInput);
            }
        } else if (this.activeInput === this.confirmPasswordInput) {
            this.setActiveInput(this.usernameInput);
        }
    }
    
    handleCharacter(char) {
        // Añadir carácter al campo activo
        if (this.activeInput === this.usernameInput) {
            // Limitar longitud del nombre de usuario
            if (this.usernameText.text.length < 20) {
                this.usernameText.setText(this.usernameText.text + char);
            }
        } else if (this.activeInput === this.passwordInput || this.activeInput === this.confirmPasswordInput) {
            // Limitar longitud de la contraseña
            const inputField = this.activeInput === this.passwordInput ? this.passwordInput : this.confirmPasswordInput;
            const textField = this.activeInput === this.passwordInput ? this.passwordText : this.confirmPasswordText;
            
            if (!inputField.realValue) {
                inputField.realValue = '';
            }
            
            if (inputField.realValue.length < 20) {
                inputField.realValue += char;
                textField.setText('*'.repeat(inputField.realValue.length));
            }
        }
    }
    
    setActiveInput(inputField) {
        // Desactivar el campo anterior
        if (this.activeInput) {
            this.activeInput.setStrokeStyle(2, 0xffffff);
        }
        
        // Activar el nuevo campo
        this.activeInput = inputField;
        
        if (inputField) {
            inputField.setStrokeStyle(3, 0x00ffff);
        }
    }
    
    createAdminButton() {
        // Crear un botón pequeño en la esquina para acceder al login de administrador
        try {
            const adminButton = this.add.image(1230, 50, 'admin-icon')
                .setScale(0.1)
                .setInteractive();
                
            adminButton.on('pointerdown', () => {
                this.isAdminLogin = true;
                this.scene.restart();
            });
        } catch (error) {
            // Si no se puede cargar la imagen, crear un botón rectangular
            const adminButton = this.add.rectangle(1230, 50, 60, 60, 0x333333)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive();
                
            const adminText = this.add.text(1230, 50, 'A', {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            adminButton.on('pointerover', () => {
                adminButton.fillColor = 0x555555;
            });
            
            adminButton.on('pointerout', () => {
                adminButton.fillColor = 0x333333;
            });
            
            adminButton.on('pointerdown', () => {
                this.isAdminLogin = true;
                this.scene.restart();
            });
        }
    }
    
    async checkServerConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/test`);
            if (response.ok) {
                console.log('Conexión con el servidor establecida correctamente');
            } else {
                this.showStatusMessage('No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.', '#ff9900');
                console.error('Error al conectar con el servidor:', await response.text());
            }
        } catch (error) {
            this.showStatusMessage('No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.', '#ff9900');
            console.error('Error al conectar con el servidor:', error);
        }
    }
    
    createInputFields() {
        // Fondo para el campo de usuario
        this.usernameInput = this.add.rectangle(640, 260, 400, 60, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff);
        
        // Etiqueta para el campo de usuario
        this.add.text(440, 260, ' Usuario:', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        
        // Campo de entrada para el usuario
        this.usernameText = this.add.text(640, 260, '', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Hacer el campo de usuario interactivo
        this.usernameInput.setInteractive();
        this.usernameInput.on('pointerdown', () => {
            this.setActiveInput(this.usernameInput);
        });
        
        // Fondo para el campo de contraseña
        this.passwordInput = this.add.rectangle(640, 340, 400, 60, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff);
        
        // Etiqueta para el campo de contraseña
        this.add.text(440, 340, ' Contraseña:', {
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
        this.passwordInput.setInteractive();
        this.passwordInput.on('pointerdown', () => {
            this.setActiveInput(this.passwordInput);
        });
        
        // Si estamos en modo registro, añadir campo para confirmar contraseña
        if (this.isRegistering) {
            // Fondo para el campo de confirmar contraseña
            this.confirmPasswordInput = this.add.rectangle(640, 420, 400, 60, 0x000000, 0.5)
                .setStrokeStyle(2, 0xffffff);
            
            // Etiqueta para el campo de confirmar contraseña
            this.add.text(440, 420, ' Confirmar:', {
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
            this.confirmPasswordInput.setInteractive();
            this.confirmPasswordInput.on('pointerdown', () => {
                this.setActiveInput(this.confirmPasswordInput);
            });
        }
        
        // Activar el campo de usuario por defecto
        this.setActiveInput(this.usernameInput);
        
        
    }
    
    createButtons() {
        // Botón principal (Login, Registro o Admin Login)
        let mainButtonY = 420;
        let mainButtonText = 'INICIAR SESIÓN';
        
        if (this.isRegistering) {
            mainButtonY = 500;
            mainButtonText = 'REGISTRARSE';
        } else if (this.isAdminLogin) {
            mainButtonText = 'ACCESO ADMIN';
        }
        
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
            } else if (this.isAdminLogin) {
                this.adminLogin();
            } else {
                this.login();
            }
        });
        
        // Botones secundarios (solo si no estamos en modo admin)
        if (!this.isAdminLogin) {
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
            
            const guestButtonLabel = this.add.text(640, guestButtonY, 'JUGAR OFFLINE', {
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
        } else {
            // Si estamos en modo admin, añadir botón para volver al login normal
            const backButton = this.add.rectangle(640, 500, 300, 60, 0xaa0000)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive();
            
            const backButtonLabel = this.add.text(640, 500, 'VOLVER', {
                fontSize: '28px',
                fill: '#fff',
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            // Efectos de hover para el botón de volver
            backButton.on('pointerover', () => {
                backButton.fillColor = 0xff0000;
                backButtonLabel.setFontSize(32);
            });
            
            backButton.on('pointerout', () => {
                backButton.fillColor = 0xaa0000;
                backButtonLabel.setFontSize(28);
            });
            
            // Acción del botón de volver
            backButton.on('pointerdown', () => {
                this.isAdminLogin = false;
                this.scene.restart();
            });
        }
    }
    
    
    async adminLogin() {
        const username = this.usernameText.text;
        const password = this.passwordInput.realValue || '';
        
        if (!username || !password) {
            this.showStatusMessage('Por favor, introduce usuario y contraseña.', '#ff0000');
            return;
        }
        
        try {
            // Mostrar mensaje de carga
            this.showStatusMessage('Verificando credenciales de administrador...', '#ffffff');
            
            // Hacer petición a la API de login de administrador
            const response = await fetch(`${this.apiUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Credenciales de administrador incorrectas');
            }
            
            // Login exitoso
            this.showStatusMessage('Login de administrador exitoso. Redirigiendo...', '#00ff00');
            
            // Guardar información del administrador
            localStorage.setItem('adminUser', JSON.stringify(data.admin));
            localStorage.setItem('isAdmin', 'true');
            
            // Esperar un momento antes de redirigir
            setTimeout(() => {
                this.scene.start('AdminScene');
            }, 1000);
        } catch (error) {
            console.error('Error en login de administrador:', error);
            this.showStatusMessage(error.message || 'Error al iniciar sesión como administrador', '#ff0000');
        }
    }
    
    async login() {
        const username = this.usernameText.text;
        const password = this.passwordInput.realValue || '';
        
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
            this.showStatusMessage(error.message || 'Error al iniciar sesión. Intenta jugar sin cuenta.', '#ff0000');
            
            // Si hay un error de conexión, mostrar un botón para jugar sin cuenta
            if (error.message.includes('fetch') || error.message.includes('network')) {
                this.showPlayAsGuestButton();
            }
        }
    }
    
    async register() {
        const username = this.usernameText.text;
        const password = this.passwordInput.realValue || '';
        const confirmPassword = this.confirmPasswordInput.realValue || '';
        
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
            
            console.log('Enviando datos de registro:', { username, password: '***' });
            
            // Hacer petición a la API
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            // Intentar obtener la respuesta como JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Error al parsear respuesta JSON:', e);
                const text = await response.text();
                console.log('Respuesta como texto:', text);
                throw new Error('Error al procesar la respuesta del servidor');
            }
            
            console.log('Respuesta del servidor:', data);
            
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
            this.showStatusMessage(error.message || 'Error al registrar usuario. Intenta jugar sin cuenta.', '#ff0000');
            
            // Si hay un error de conexión, mostrar un botón para jugar sin cuenta
            if (error.message.includes('fetch') || error.message.includes('network')) {
                this.showPlayAsGuestButton();
            }
        }
    }
    
    showPlayAsGuestButton() {
        // Crear un botón especial para jugar sin cuenta cuando hay problemas de conexión
        const guestButton = this.add.rectangle(640, 700, 400, 60, 0xff5500)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const guestButtonLabel = this.add.text(640, 700, 'JUGAR SIN CONEXIÓN', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Efectos de hover
        guestButton.on('pointerover', () => {
            guestButton.fillColor = 0xff7700;
            guestButtonLabel.setFontSize(32);
        });
        
        guestButton.on('pointerout', () => {
            guestButton.fillColor = 0xff5500;
            guestButtonLabel.setFontSize(28);
        });
        
        // Acción del botón
        guestButton.on('pointerdown', () => {
            this.playAsGuest();
        });
    }
    
    playAsGuest() {
        // Jugar sin cuenta
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
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
