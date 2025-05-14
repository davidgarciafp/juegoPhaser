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

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/juegoPhaser', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB - Base de datos: juegoPhaser'))
.catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Salir si no podemos conectar a MongoDB
});

// Esquema de usuario
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    scores: [Number],
    createdAt: { type: Date, default: Date.now }
});

// Modelo de usuario
const User = mongoose.model('User', userSchema);

// Esquema de administrador
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Modelo de administrador
const Admin = mongoose.model('Admin', adminSchema,'admins');

// Función para crear un administrador por defecto
const createDefaultAdmin = async () => {
    try {
        // Verificar si ya existe un administrador con el nombre "admin"
        const adminExists = await Admin.findOne({ username: 'admin' });
        
        if (!adminExists) {
            // Encriptar la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            // Crear el administrador
            const newAdmin = new Admin({
                username: 'admin',
                password: hashedPassword
            });
            
            // Guardar el administrador
            await newAdmin.save();
            
            console.log('Administrador por defecto creado: admin / admin123');
        } else {
            console.log('El administrador por defecto ya existe');
        }
    } catch (error) {
        console.error('Error al crear administrador por defecto:', error);
    }
};

// Llamar a la función para crear el administrador por defecto
createDefaultAdmin();

// ===== RUTAS DE LA API DEL JUEGO =====

// Rutas
// Login de administrador
app.post('/api/admin/login', async (req, res) => {
    try {
        console.log('Petición de login de administrador recibida:', req.body);
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña' });
        }
        
        // Buscar administrador
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Credenciales de administrador incorrectas' });
        }
        
        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciales de administrador incorrectas' });
        }
        
        // Devolver administrador sin la contraseña
        const adminResponse = {
            _id: admin._id,
            username: admin.username
        };
        
        console.log('Login de administrador exitoso:', adminResponse);
        res.status(200).json({ admin: adminResponse, message: 'Login de administrador exitoso' });
    } catch (error) {
        console.error('Error en login de administrador:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});
// Registro de usuario
app.post('/api/register', async (req, res) => {
    try {
        console.log('Petición de registro recibida:', req.body);
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña' });
        }
        
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
        
        console.log('Usuario registrado correctamente:', userResponse);
        res.status(201).json({ user: userResponse, message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
    try {
        console.log('Petición de login recibida:', req.body);
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña' });
        }
        
        // Buscar usuario
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        // Verificar contraseña
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
        
        console.log('Login exitoso:', userResponse);
        res.status(200).json({ user: userResponse, message: 'Login exitoso' });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Guardar puntuación
app.post('/api/scores', async (req, res) => {
    try {
        console.log('Petición para guardar puntuación recibida:', req.body);
        
        const { userId, score } = req.body;
        
        if (!userId || score === undefined) {
            return res.status(400).json({ message: 'Se requiere ID de usuario y puntuación' });
        }
        
        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Añadir puntuación
        user.scores.push(score);
        await user.save();
        
        console.log(`Puntuación ${score} guardada para el usuario ${user.username}`);
        res.status(200).json({ message: 'Puntuación guardada correctamente', scores: user.scores });
    } catch (error) {
        console.error('Error al guardar puntuación:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Obtener puntuaciones de un usuario
app.get('/api/scores/:userId', async (req, res) => {
    try {
        console.log('Petición para obtener puntuaciones recibida:', req.params);
        
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'Se requiere ID de usuario' });
        }
        
        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        console.log(`Puntuaciones obtenidas para el usuario ${user.username}`);
        res.status(200).json({ scores: user.scores });
    } catch (error) {
        console.error('Error al obtener puntuaciones:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'El servidor está funcionando correctamente' });
});

// Obtener clasificación de todos los usuarios
app.get('/api/leaderboard', async (req, res) => {
    try {
        console.log('Petición para obtener clasificación recibida');
        
        // Buscar todos los usuarios y ordenarlos por su mejor puntuación
        const users = await User.find({}, 'username scores');
        
        // Procesar los datos para obtener la mejor puntuación de cada usuario
        const leaderboard = users.map(user => {
            const bestScore = user.scores.length > 0 ? Math.max(...user.scores) : 0;
            return {
                username: user.username,
                bestScore: bestScore
            };
        });
        
        // Ordenar por puntuación (de mayor a menor)
        leaderboard.sort((a, b) => b.bestScore - a.bestScore);
        
        console.log('Clasificación obtenida correctamente');
        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Error al obtener clasificación:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// ===== RUTAS DE ADMINISTRACIÓN =====

// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
    try {
        console.log('Petición para obtener todos los usuarios');
        
        // Buscar todos los usuarios
        const users = await User.find({}, '-password');
        
        console.log(`Se encontraron ${users.length} usuarios`);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Actualizar usuario
app.put('/api/users/:userId', async (req, res) => {
    try {
        console.log('Petición para actualizar usuario:', req.params.userId);
        
        const { userId } = req.params;
        const { username, password, resetScores } = req.body;
        
        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Verificar si el nuevo nombre de usuario ya existe (si se cambió)
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
            }
            
            user.username = username;
        }
        
        // Actualizar contraseña si se proporcionó una nueva
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }
        
        // Resetear puntuaciones si se solicitó
        if (resetScores) {
            user.scores = [];
        }
        
        // Guardar cambios
        await user.save();
        
        // Devolver usuario actualizado sin la contraseña
        const userResponse = {
            _id: user._id,
            username: user.username,
            scores: user.scores,
            createdAt: user.createdAt
        };
        
        console.log('Usuario actualizado correctamente:', userResponse);
        res.status(200).json({ user: userResponse, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Eliminar usuario
app.delete('/api/users/:userId', async (req, res) => {
    try {
        console.log('Petición para eliminar usuario:', req.params.userId);
        
        const { userId } = req.params;
        
        // Eliminar usuario
        const result = await User.findByIdAndDelete(userId);
        
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        console.log('Usuario eliminado correctamente');
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`API disponible en http://localhost:${PORT}/api`);
});
