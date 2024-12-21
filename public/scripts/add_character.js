document.getElementById('addCharacterForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    const name = document.getElementById('characterName').value.trim();
    const characterClass = document.getElementById('characterClass').value.trim();
    const level = document.getElementById('characterLevel').value.trim();

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}/characters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                class: characterClass,
                level: level || 1,
            }),
        });

        if (response.ok) {
            window.location.href = `../profile.html?id=${userId}`;
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});