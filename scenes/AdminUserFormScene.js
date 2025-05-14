export class AdminUserFormScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdminUserFormScene' });
        this.apiUrl = 'http://localhost:3000/api';
        this.mode = 'create'; // 'create' o 'edit'
        this.user = null;
        this.onComplete = null;
    }

    init(data) {
        this.mode = data.mode || 'create';
        this.user = data.user || null;
        this.onComplete = data.onComplete || function() {};
    }

    create() {
        // Fondo semitransparente
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        
        // Panel del formulario
        this.add.rectangle(640, 360, 600, 500, 0x222244)
            .setStrokeStyle(2, 0xffffff);
        
        // Título
        const titleText = this.mode === 'create' ? 'CREAR NUEVO USUARIO' : 'EDITAR USUARIO';
        this.add.text(640, 160, titleText, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Campos del formulario
        this.createFormFields();
        
        // Botones
        this.createButtons();
        
        // Mensaje de estado
        this.statusMessage = this.add.text(640, 550, '', {
            fontSize: '18px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }
    
    createFormFields() {
        // Campo de usuario
        this.add.text(440, 230, 'Usuario:', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        
        const userFieldBg = this.add.rectangle(640, 230, 400, 50, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        this.usernameText = this.add.text(640, 230, this.user ? this.user.username : '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        userFieldBg.on('pointerdown', () => {
            this.promptUsername();
        });
        
        // Campo de contraseña
        this.add.text(440, 300, 'Contraseña:', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        
        const passwordFieldBg = this.add.rectangle(640, 300, 400, 50, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        this.passwordText = this.add.text(640, 300, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        passwordFieldBg.on('pointerdown', () => {
            this.promptPassword();
        });
        
        // Nota sobre la contraseña (solo en modo edición)
        if (this.mode === 'edit') {
            this.add.text(640, 340, 'Dejar en blanco para mantener la contraseña actual', {
                fontSize: '16px',
                fill: '#aaaaaa',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }
        
        // Checkbox para resetear puntuaciones (solo en modo edición)
        if (this.mode === 'edit') {
            this.resetScoresCheckbox = this.add.rectangle(460, 400, 30, 30, 0x000000, 0.5)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive();
            
            this.resetScoresCheckmark = this.add.text(460, 400, '✓', {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.resetScoresCheckmark.visible = false;
            
            this.add.text(500, 400, 'Resetear puntuaciones', {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            
            this.resetScoresCheckbox.on('pointerdown', () => {
                this.resetScoresCheckmark.visible = !this.resetScoresCheckmark.visible;
            });
        }
    }
    
    createButtons() {
        // Botón de guardar
        const saveButton = this.add.rectangle(540, 480, 200, 50, 0x00aa00)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const saveText = this.add.text(540, 480, 'GUARDAR', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover
        saveButton.on('pointerover', () => {
            saveButton.fillColor = 0x00ff00;
            saveText.setFontSize(24);
        });
        
        saveButton.on('pointerout', () => {
            saveButton.fillColor = 0x00aa00;
            saveText.setFontSize(22);
        });
        
        // Acción del botón
        saveButton.on('pointerdown', () => {
            this.saveUser();
        });
        
        // Botón de cancelar
        const cancelButton = this.add.rectangle(740, 480, 200, 50, 0xaa0000)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const cancelText = this.add.text(740, 480, 'CANCELAR', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover
        cancelButton.on('pointerover', () => {
            cancelButton.fillColor = 0xff0000;
            cancelText.setFontSize(24);
        });
        
        cancelButton.on('pointerout', () => {
            cancelButton.fillColor = 0xaa0000;
            cancelText.setFontSize(22);
        });
        
        // Acción del botón
        cancelButton.on('pointerdown', () => {
            this.closeForm();
        });
    }
    
    promptUsername() {
        const username = prompt('Introduce el nombre de usuario:', this.usernameText.text);
        if (username !== null) {
            this.usernameText.setText(username);
        }
    }
    
    promptPassword() {
        const password = prompt('Introduce la contraseña:');
        if (password !== null) {
            // Mostrar asteriscos en lugar de la contraseña real
            this.passwordText.setText('*'.repeat(password.length));
            // Guardar la contraseña real en una propiedad no visible
            this.passwordText.realPassword = password;
        }
    }
    
    async saveUser() {
        const username = this.usernameText.text;
        const password = this.passwordText.realPassword || '';
        
        if (!username) {
            this.statusMessage.setText('El nombre de usuario es obligatorio');
            return;
        }
        
        if (this.mode === 'create' && !password) {
            this.statusMessage.setText('La contraseña es obligatoria para nuevos usuarios');
            return;
        }
        
        try {
            if (this.mode === 'create') {
                await this.createUser(username, password);
            } else {
                const resetScores = this.resetScoresCheckmark.visible;
                await this.updateUser(username, password, resetScores);
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            this.statusMessage.setText('Error al guardar usuario. Guardando localmente.');
            
            // Fallback: guardar localmente
            if (this.mode === 'create') {
                this.createLocalUser(username, password);
            } else {
                const resetScores = this.resetScoresCheckmark.visible;
                this.updateLocalUser(username, password, resetScores);
            }
        }
    }
    
    async createUser(username, password) {
        // Intentar crear usuario en el servidor
        const response = await fetch(`${this.apiUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al crear usuario');
        }
        
        // Cerrar formulario y actualizar lista
        this.closeForm(true);
    }
    
    async updateUser(username, password, resetScores) {
        // Preparar datos para actualizar
        const updateData = { username };
        if (password) updateData.password = password;
        if (resetScores) updateData.resetScores = true;
        
        // Intentar actualizar usuario en el servidor
        const response = await fetch(`${this.apiUrl}/users/${this.user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al actualizar usuario');
        }
        
        // Cerrar formulario y actualizar lista
        this.closeForm(true);
    }
    
    createLocalUser(username, password) {
        try {
            // Obtener usuarios existentes
            let users = [];
            const usersJson = localStorage.getItem('users');
            if (usersJson) {
                users = JSON.parse(usersJson);
            }
            
            // Verificar si el usuario ya existe
            if (users.some(u => u.username === username)) {
                this.statusMessage.setText('El nombre de usuario ya está en uso');
                return;
            }
            
            // Crear nuevo usuario
            const newUser = {
                _id: Date.now().toString(),
                username,
                password: 'encrypted_' + password, // Simulación de encriptación
                scores: [],
                createdAt: new Date().toISOString()
            };
            
            // Añadir a la lista
            users.push(newUser);
            
            // Guardar en localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Cerrar formulario y actualizar lista
            this.closeForm(true);
        } catch (error) {
            console.error('Error al crear usuario localmente:', error);
            this.statusMessage.setText('Error al crear usuario');
        }
    }
    
    updateLocalUser(username, password, resetScores) {
        try {
            // Obtener usuarios existentes
            let users = [];
            const usersJson = localStorage.getItem('users');
            if (usersJson) {
                users = JSON.parse(usersJson);
            }
            
            // Buscar el usuario a actualizar
            const userIndex = users.findIndex(u => u._id === this.user._id);
            if (userIndex === -1) {
                this.statusMessage.setText('Usuario no encontrado');
                return;
            }
            
            // Verificar si el nuevo nombre de usuario ya está en uso por otro usuario
            if (username !== this.user.username && 
                users.some(u => u.username === username && u._id !== this.user._id)) {
                this.statusMessage.setText('El nombre de usuario ya está en uso');
                return;
            }
            
            // Actualizar usuario
            users[userIndex].username = username;
            if (password) {
                users[userIndex].password = 'encrypted_' + password;
            }
            if (resetScores) {
                users[userIndex].scores = [];
            }
            
            // Guardar en localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Cerrar formulario y actualizar lista
            this.closeForm(true);
        } catch (error) {
            console.error('Error al actualizar usuario localmente:', error);
            this.statusMessage.setText('Error al actualizar usuario');
        }
    }
    
    closeForm(success = false) {
        if (success) {
            this.onComplete();
        }
        this.scene.resume('AdminScene');
        this.scene.stop();
    }
}