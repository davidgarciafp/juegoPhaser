// Función para guardar la puntuación del usuario actual
export const saveUserScore = async (score) => {
    try {
        // Obtener el usuario actual
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return; // No hay usuario conectado
        
        const currentUser = JSON.parse(userJson);
        
        // Enviar puntuación a la API
        const apiUrl = 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
        
        console.log(`Puntuación ${score} guardada para el usuario ${currentUser.username}`);
    } catch (error) {
        console.error('Error al guardar puntuación:', error);
        
        // Fallback: guardar localmente si la API falla
        saveScoreLocally(score);
    }
};

// Función para guardar la puntuación localmente (como fallback)
const saveScoreLocally = (score) => {
    try {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return;
        
        const currentUser = JSON.parse(userJson);
        
        if (!currentUser.scores) {
            currentUser.scores = [];
        }
        
        currentUser.scores.push(score);
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInArray(currentUser);
        
        console.log(`Puntuación ${score} guardada localmente para ${currentUser.username}`);
    } catch (error) {
        console.error('Error al guardar puntuación localmente:', error);
    }
};

// Función para actualizar el usuario en el array de usuarios
const updateUserInArray = (updatedUser) => {
    try {
        // Obtener todos los usuarios
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return;
        
        const users = JSON.parse(usersJson);
        
        // Encontrar y actualizar el usuario
        const userIndex = users.findIndex(u => u.username === updatedUser.username);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            
            // Guardar el array actualizado
            localStorage.setItem('users', JSON.stringify(users));
        }
    } catch (error) {
        console.error('Error al actualizar usuario en array:', error);
    }
};
