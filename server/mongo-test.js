const mongoose = require('mongoose');

// Conexión a MongoDB local con la base de datos juegoPhaser
mongoose.connect('mongodb://localhost:27017/juegoPhaser', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Conexión exitosa a MongoDB - Base de datos: juegoPhaser');
    
    // Crear un modelo simple para probar la escritura
    const TestModel = mongoose.model('Test', new mongoose.Schema({
        name: String,
        date: { type: Date, default: Date.now }
    }));
    
    // Intentar escribir un documento
    return TestModel.create({ name: 'test-connection' });
})
.then(doc => {
    console.log('✅ Documento de prueba creado correctamente:', doc);
    
    // Intentar leer el documento
    return mongoose.model('Test').findOne({ name: 'test-connection' });
})
.then(doc => {
    console.log('✅ Documento de prueba leído correctamente:', doc);
    console.log('✅ La conexión a MongoDB funciona correctamente para lectura y escritura');
    
    // Limpiar el documento de prueba
    return mongoose.model('Test').deleteOne({ name: 'test-connection' });
})
.then(() => {
    console.log('✅ Documento de prueba eliminado correctamente');
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error al conectar o interactuar con MongoDB:', err);
    process.exit(1);
});