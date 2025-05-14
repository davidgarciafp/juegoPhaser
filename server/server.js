const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// Definir esquema de usuario
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    scores: [Number],
    createdAt: { type: Date, default: Date.now }
});

// Modelo de usuario
const User = mongoose.model('User', userSchema);

// Rutas
// Registro de usuario
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }
        
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Crear nuevo usuario
        const newUser = new User({
            username,
            password: hashedPassword,
            scores: []
        });
        
        // Guardar usuario
        await newUser.save();
        
        // Devolver usuario sin la contraseña
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            scores: newUser.scores
        };
        
        res.status(201).json({ user: userResponse, message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Buscar usuario
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        // Verificar contrase��a
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        // Devolver usuario sin la contraseña
        const userResponse = {
            _id: user._id,
            username: user.username,
            scores: user.scores
        };
        
        res.status(200).json({ user: userResponse, message: 'Login exitoso' });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Guardar puntuación
app.post('/api/scores', async (req, res) => {
    try {
        const { userId, score } = req.body;
        
        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Añadir puntuación
        user.scores.push(score);
        await user.save();
        
        res.status(200).json({ message: 'Puntuación guardada correctamente', scores: user.scores });
    } catch (error) {
        console.error('Error al guardar puntuación:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener puntuaciones de un usuario
app.get('/api/scores/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.status(200).json({ scores: user.scores });
    } catch (error) {
        console.error('Error al obtener puntuaciones:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});