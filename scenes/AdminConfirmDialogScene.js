export class AdminConfirmDialogScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdminConfirmDialogScene' });
        this.title = '';
        this.message = '';
        this.onConfirm = null;
        this.onCancel = null;
    }

    init(data) {
        this.title = data.title || 'Confirmar';
        this.message = data.message || '¿Estás seguro?';
        this.onConfirm = data.onConfirm || function() {};
        this.onCancel = data.onCancel || function() {};
    }

    create() {
        // Fondo semitransparente
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        
        // Panel del diálogo
        this.add.rectangle(640, 360, 500, 300, 0x222244)
            .setStrokeStyle(2, 0xffffff);
        
        // Título
        this.add.text(640, 260, this.title, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Mensaje
        this.add.text(640, 330, this.message, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5);
        
        // Botones
        this.createButtons();
    }
    
    createButtons() {
        // Botón de confirmar
        const confirmButton = this.add.rectangle(540, 420, 180, 50, 0x00aa00)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const confirmText = this.add.text(540, 420, 'CONFIRMAR', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover
        confirmButton.on('pointerover', () => {
            confirmButton.fillColor = 0x00ff00;
            confirmText.setFontSize(22);
        });
        
        confirmButton.on('pointerout', () => {
            confirmButton.fillColor = 0x00aa00;
            confirmText.setFontSize(20);
        });
        
        // Acción del botón
        confirmButton.on('pointerdown', () => {
            this.confirm();
        });
        
        // Botón de cancelar
        const cancelButton = this.add.rectangle(740, 420, 180, 50, 0xaa0000)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        const cancelText = this.add.text(740, 420, 'CANCELAR', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Efectos de hover
        cancelButton.on('pointerover', () => {
            cancelButton.fillColor = 0xff0000;
            cancelText.setFontSize(22);
        });
        
        cancelButton.on('pointerout', () => {
            cancelButton.fillColor = 0xaa0000;
            cancelText.setFontSize(20);
        });
        
        // Acción del botón
        cancelButton.on('pointerdown', () => {
            this.cancel();
        });
    }
    
    confirm() {
        // Ejecutar callback de confirmación
        this.onConfirm();
        
        // Cerrar diálogo
        this.closeDialog();
    }
    
    cancel() {
        // Ejecutar callback de cancelación
        this.onCancel();
        
        // Cerrar diálogo
        this.closeDialog();
    }
    
    closeDialog() {
        // Reanudar la escena anterior y detener esta
        this.scene.resume('AdminScene');
        this.scene.stop();
    }
}