document.getElementById('addCharacterForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    const name = document.getElementById('characterName').value;
    const characterClass = document.getElementById('characterClass').value;
    const level = document.getElementById('characterLevel').value;

    const response = await fetch(`http://localhost:5000/api/user/${userId}/characters/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            class: characterClass,
            level,
        }),
    });

    if (response.ok) {
        window.location.href = `../profile.html?id=${userId}`;
    } else {
        const error = await response.json();
        console.error(`Error: ${error.message}`);
    }
});