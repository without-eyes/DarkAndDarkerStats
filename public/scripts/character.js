document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    const userId = urlParams.get('userId');

    if (!characterId || !userId) {
        console.error('Character ID або User ID відсутні в URL');
        document.getElementById('characterName').textContent = 'Character not found';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}/characters/${characterId}`);
        if (!response.ok) throw new Error('Не вдалося отримати дані персонажа');
        const character = await response.json();
        document.getElementById('characterName').textContent = character.name || 'Unknown Name';
        document.getElementById('characterLevel').textContent = `Level: ${character.level || 'N/A'}`;
        document.getElementById('characterClass').textContent = `Class: ${character.class || 'N/A'}`;
        document.getElementById('characterCreationDate').textContent = `Creation date: ${character.created_at || 'N/A'}`;
    } catch (error) {
        console.error('Помилка завантаження даних персонажа:', error);
        document.getElementById('characterName').textContent = 'Error loading character details';
    }
});