export class AdminScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdminScene' });
        this.apiUrl = 'http://localhost:3000/api';
        this.users = [];
        this.currentPage = 0;
        this.usersPerPage = 5;
        this.selectedUser = null;
    }

    preload() {
        // Cargar recursos para la pantalla de administración
        this.load.image('admin-background', 'assets/images/menu-background.png');
    }

    create() {
        console.log("AdminScene: create iniciado");
        
        // Añadir fondo
        try {
            this.add.image(640, 360, 'admin-background').setScale(1);
        } catch (error) {
            console.warn("No se pudo cargar el fondo de administración:", error);
            this.cameras.main.setBackgroundColor('#222244');
        }
        
        // Título
        this.add.text(640, 60, 'PANEL DE ADMINISTRACIÓN', {
            fontSize: '40px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtítulo
        this.add.text(640, 120, 'Gestión de Usuarios', {
            fontSize: '30px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Mensaje de estado
        this.statusMessage = this.add.text(640, 650, 'Cargando usuarios...', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Crear botones de navegación
        this.createNavigationButtons();
        
        // Cargar usuarios
        this.loadUsers();
        
        console.log("AdminScene: create completado");
    }
    
    createNavigationButtons() {
        // Botón para volver al menú principal
        const backButton = this.add.rectangle(120, 60, 180, 50, 0xaa0000)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const backButtonLabel = this.add.text(120, 60, 'VOLVER', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover
        backButton.on('pointerover', () => {
            backButton.fillColor = 0xff0000;
            backButtonLabel.setFontSize(22);
        });
        
        backButton.on('pointerout', () => {
            backButton.fillColor = 0xaa0000;
            backButtonLabel.setFontSize(20);
        });
        
        // Acción del botón - Redirigir al login de usuarios
        backButton.on('pointerdown', () => {
            // Limpiar información de administrador
            localStorage.removeItem('adminUser');
            localStorage.removeItem('isAdmin');
            
            // Volver a la escena de login
            this.scene.start('LoginScene');
        });
        
        // Botón para crear un nuevo usuario
        const newUserButton = this.add.rectangle(1160, 60, 180, 50, 0x00aa00)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const newUserButtonLabel = this.add.text(1160, 60, 'NUEVO USUARIO', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover
        newUserButton.on('pointerover', () => {
            newUserButton.fillColor = 0x00ff00;
            newUserButtonLabel.setFontSize(22);
        });
        
        newUserButton.on('pointerout', () => {
            newUserButton.fillColor = 0x00aa00;
            newUserButtonLabel.setFontSize(20);
        });
        
        // Acción del botón
        newUserButton.on('pointerdown', () => {
            this.showCreateUserForm();
        });
        
        // Botones de paginación
        this.prevButton = this.add.rectangle(540, 600, 100, 40, 0x0000aa)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        this.prevButtonLabel = this.add.text(540, 600, '< PREV', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.nextButton = this.add.rectangle(740, 600, 100, 40, 0x0000aa)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        this.nextButtonLabel = this.add.text(740, 600, 'NEXT >', {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover y acciones para botones de paginación
        this.prevButton.on('pointerover', () => this.prevButton.fillColor = 0x0000ff);
        this.prevButton.on('pointerout', () => this.prevButton.fillColor = 0x0000aa);
        this.prevButton.on('pointerdown', () => this.prevPage());
        
        this.nextButton.on('pointerover', () => this.nextButton.fillColor = 0x0000ff);
        this.nextButton.on('pointerout', () => this.nextButton.fillColor = 0x0000aa);
        this.nextButton.on('pointerdown', () => this.nextPage());
        
        // Inicialmente ocultar los botones de paginación
        this.prevButton.visible = false;
        this.prevButtonLabel.visible = false;
        this.nextButton.visible = false;
        this.nextButtonLabel.visible = false;
    }
    
    async loadUsers() {
        try {
            // Intentar cargar usuarios desde el servidor
            const response = await fetch(`${this.apiUrl}/users`);
            
            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }
            
            const data = await response.json();
            this.users = data.users || [];
            
            // Mostrar usuarios
            this.displayUsers();
            this.statusMessage.setText('');
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            this.statusMessage.setText('Error al cargar usuarios. Usando datos locales.');
            
            // Intentar cargar usuarios del localStorage como fallback
            this.loadLocalUsers();
        }
    }
    
    loadLocalUsers() {
        try {
            const usersJson = localStorage.getItem('users');
            if (usersJson) {
                this.users = JSON.parse(usersJson);
                this.displayUsers();
            } else {
                this.statusMessage.setText('No hay usuarios disponibles.');
            }
        } catch (error) {
            console.error('Error al cargar usuarios locales:', error);
            this.statusMessage.setText('No se pudieron cargar los usuarios.');
        }
    }
    
    displayUsers() {
        // Limpiar usuarios anteriores
        if (this.userElements) {
            this.userElements.forEach(element => {
                if (element) element.destroy();
            });
        }
        
        this.userElements = [];
        
        if (this.users.length === 0) {
            this.statusMessage.setText('No hay usuarios registrados.');
            return;
        }
        
        // Calcular páginas
        const totalPages = Math.ceil(this.users.length / this.usersPerPage);
        
        // Actualizar visibilidad de botones de paginación
        this.prevButton.visible = totalPages > 1 && this.currentPage > 0;
        this.prevButtonLabel.visible = totalPages > 1 && this.currentPage > 0;
        this.nextButton.visible = totalPages > 1 && this.currentPage < totalPages - 1;
        this.nextButtonLabel.visible = totalPages > 1 && this.currentPage < totalPages - 1;
        
        // Obtener usuarios para la página actual
        const startIndex = this.currentPage * this.usersPerPage;
        const endIndex = Math.min(startIndex + this.usersPerPage, this.users.length);
        const pageUsers = this.users.slice(startIndex, endIndex);
        
        // Crear tabla de usuarios
        const tableTop = 180;
        const rowHeight = 80;
        
        // Encabezados de la tabla
        this.userElements.push(this.add.rectangle(640, tableTop, 1000, 50, 0x333333).setStrokeStyle(2, 0xffffff));
        
        this.userElements.push(this.add.text(200, tableTop, 'USUARIO', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5));
        
        this.userElements.push(this.add.text(500, tableTop, 'MEJOR PUNTUACIÓN', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5));
        
        this.userElements.push(this.add.text(800, tableTop, 'ACCIONES', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5));
        
        // Filas de usuarios
        pageUsers.forEach((user, index) => {
            const rowY = tableTop + 50 + (index * rowHeight);
            
            // Fondo de la fila
            const rowBg = this.add.rectangle(640, rowY, 1000, rowHeight - 10, 0x222244, 0.7)
                .setStrokeStyle(1, 0x444466);
            this.userElements.push(rowBg);
            
            // Nombre de usuario
            const usernameText = this.add.text(200, rowY, user.username, {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            this.userElements.push(usernameText);
            
            // Mejor puntuación
            const bestScore = user.scores && user.scores.length > 0 ? Math.max(...user.scores) : 0;
            const scoreText = this.add.text(500, rowY, bestScore.toString(), {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            this.userElements.push(scoreText);
            
            // Botones de acción
            // Botón de editar
            const editButton = this.add.rectangle(800, rowY, 100, 40, 0x0088aa)
                .setStrokeStyle(1, 0xffffff)
                .setInteractive();
            this.userElements.push(editButton);
            
            const editText = this.add.text(800, rowY, 'EDITAR', {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.userElements.push(editText);
            
            // Botón de eliminar
            const deleteButton = this.add.rectangle(920, rowY, 100, 40, 0xaa0000)
                .setStrokeStyle(1, 0xffffff)
                .setInteractive();
            this.userElements.push(deleteButton);
            
            const deleteText = this.add.text(920, rowY, 'ELIMINAR', {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.userElements.push(deleteText);
            
            // Efectos de hover y acciones
            editButton.on('pointerover', () => editButton.fillColor = 0x00aadd);
            editButton.on('pointerout', () => editButton.fillColor = 0x0088aa);
            editButton.on('pointerdown', () => this.editUser(user));
            
            deleteButton.on('pointerover', () => deleteButton.fillColor = 0xff0000);
            deleteButton.on('pointerout', () => deleteButton.fillColor = 0xaa0000);
            deleteButton.on('pointerdown', () => this.confirmDeleteUser(user));
        });
        
        // Mostrar información de paginación
        if (totalPages > 1) {
            const paginationText = `Página ${this.currentPage + 1} de ${totalPages}`;
            const paginationLabel = this.add.text(640, 600, paginationText, {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.userElements.push(paginationLabel);
        }
    }
    
    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.displayUsers();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.users.length / this.usersPerPage);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.displayUsers();
        }
    }
    
    showCreateUserForm() {
        // Implementar en AdminUserForm.js
        this.scene.launch('AdminUserFormScene', { mode: 'create', onComplete: () => this.loadUsers() });
        this.scene.pause();
    }
    
    editUser(user) {
        // Implementar en AdminUserForm.js
        this.scene.launch('AdminUserFormScene', { 
            mode: 'edit', 
            user: user, 
            onComplete: () => this.loadUsers() 
        });
        this.scene.pause();
    }
    
    confirmDeleteUser(user) {
        // Implementar en AdminConfirmDialog.js
        this.scene.launch('AdminConfirmDialogScene', {
            title: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar al usuario "${user.username}"?`,
            onConfirm: () => this.deleteUser(user),
            onCancel: () => {}
        });
        this.scene.pause();
    }
    
    async deleteUser(user) {
        try {
            // Intentar eliminar usuario en el servidor
            const response = await fetch(`${this.apiUrl}/users/${user._id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar usuario');
            }
            
            // Recargar usuarios
            this.loadUsers();
            this.statusMessage.setText('Usuario eliminado correctamente');
            
            // Limpiar mensaje después de un tiempo
            setTimeout(() => {
                this.statusMessage.setText('');
            }, 3000);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            this.statusMessage.setText('Error al eliminar usuario. Eliminando localmente.');
            
            // Fallback: eliminar localmente
            this.deleteLocalUser(user);
        }
    }
    
    deleteLocalUser(user) {
        try {
            // Eliminar usuario del array local
            this.users = this.users.filter(u => u._id !== user._id);
            
            // Actualizar localStorage
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // Actualizar vista
            this.displayUsers();
            this.statusMessage.setText('Usuario eliminado localmente');
            
            // Limpiar mensaje después de un tiempo
            setTimeout(() => {
                this.statusMessage.setText('');
            }, 3000);
        } catch (error) {
            console.error('Error al eliminar usuario localmente:', error);
            this.statusMessage.setText('Error al eliminar usuario');
        }
    }
}
