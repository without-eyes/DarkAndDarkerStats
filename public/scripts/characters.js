document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    try {
        const charactersResponse = await fetch(`http://localhost:5000/api/user/${userId}/characters`);
        if (!charactersResponse.ok) throw new Error(`Failed to fetch characters: ${charactersResponse.status}`);
        const characters = await charactersResponse.json();

        const charactersList = document.getElementById('charactersList');
        charactersList.innerHTML = '';
        characters.forEach(character => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="character.html?userId=${userId}&id=${character.id}">${character.name}</a>`;
            charactersList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
});