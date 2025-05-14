// Función para guardar la puntuación del usuario actual
export const saveUserScore = async (score) => {
    try {
        // Obtener el usuario actual
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return { success: false, error: 'No hay usuario conectado' }; // No hay usuario conectado
        
        const currentUser = JSON.parse(userJson);
        
        // Verificar si esta puntuación es mejor que las anteriores
        let isBestScore = false;
        if (!currentUser.scores || currentUser.scores.length === 0) {
            isBestScore = true;
        } else {
            // Extraer solo los valores numéricos de las puntuaciones
            const scoreValues = currentUser.scores.map(s => 
                typeof s === 'object' ? s.score : s
            );
            const bestScore = Math.max(...scoreValues);
            isBestScore = score > bestScore;
        }
        
        // Mensaje de log
        if (isBestScore) {
            console.log(`¡Nueva mejor puntuación para ${currentUser.username}: ${score}!`);
        } else {
            console.log(`Puntuación guardada para ${currentUser.username}: ${score}`);
        }
        
        try {
            // Enviar puntuación a la API
            const apiUrl = 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    userId: currentUser._id, 
                    score 
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar puntuación');
            }
            
            // Actualizar el usuario local con las nuevas puntuaciones
            currentUser.scores = data.scores;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            return { success: true, isBestScore };
        } catch (error) {
            console.error('Error al guardar puntuación en el servidor:', error);
            // Fallback: guardar localmente si la API falla
            return saveScoreLocally(score, currentUser);
        }
    } catch (error) {
        console.error('Error al guardar puntuación:', error);
        return { success: false, error: error.message };
    }
};

// Función para guardar la puntuación localmente (como fallback)
const saveScoreLocally = (score, currentUser) => {
    try {
        if (!currentUser) {
            const userJson = localStorage.getItem('currentUser');
            if (!userJson) return { success: false, error: 'No hay usuario conectado' };
            currentUser = JSON.parse(userJson);
        }
        
        if (!currentUser.scores) {
            currentUser.scores = [];
        }
        
        // Verificar si esta puntuación es mejor que las anteriores
        let isBestScore = false;
        if (currentUser.scores.length === 0) {
            isBestScore = true;
        } else {
            // Extraer solo los valores numéricos de las puntuaciones
            const scoreValues = currentUser.scores.map(s => 
                typeof s === 'object' ? s.score : s
            );
            const bestScore = Math.max(...scoreValues);
            isBestScore = score > bestScore;
        }
        
        // Añadir la nueva puntuación con fecha
        currentUser.scores.push({
            score,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateLocalUserArray(currentUser);
        
        console.log(`Puntuación ${score} guardada localmente para ${currentUser.username}`);
        return { success: true, isBestScore };
    } catch (error) {
        console.error('Error al guardar puntuación localmente:', error);
        return { success: false, error: error.message };
    }
};

// Función para actualizar el usuario en el array de usuarios
const updateLocalUserArray = (updatedUser) => {
    try {
        // Obtener todos los usuarios
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return;
        
        const users = JSON.parse(usersJson);
        
        // Buscar si el usuario ya existe
        const userIndex = users.findIndex(u => u.username === updatedUser.username);
        
        if (userIndex !== -1) {
            // Actualizar el usuario existente
            users[userIndex] = updatedUser;
        } else {
            // Añadir el nuevo usuario
            users.push(updatedUser);
        }
        
        // Guardar el array actualizado
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Error al actualizar usuario en array:', error);
    }
};

// Función para obtener las mejores puntuaciones
export const getTopScores = async (limit = 10) => {
    try {
        // Intentar obtener puntuaciones de la API
        const apiUrl = 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/scores/top?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('No se pudieron obtener las puntuaciones del servidor');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener puntuaciones del servidor:', error);
        
        // Fallback: obtener puntuaciones locales
        return getLocalTopScores(limit);
    }
};

// Función para obtener puntuaciones locales como fallback
const getLocalTopScores = (limit = 10) => {
    try {
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return [];
        
        const users = JSON.parse(usersJson);
        
        // Recopilar todas las puntuaciones de todos los usuarios
        let allScores = [];
        users.forEach(user => {
            if (user.scores && Array.isArray(user.scores)) {
                const userScores = user.scores.map(score => ({
                    username: user.username,
                    score: typeof score === 'object' ? score.score : score,
                    date: typeof score === 'object' ? score.date : new Date().toISOString()
                }));
                allScores = [...allScores, ...userScores];
            }
        });
        
        // Ordenar por puntuación (de mayor a menor)
        allScores.sort((a, b) => b.score - a.score);
        
        // Devolver solo el número solicitado
        return allScores.slice(0, limit);
    } catch (error) {
        console.error('Error al obtener puntuaciones locales:', error);
        return [];
    }
};
