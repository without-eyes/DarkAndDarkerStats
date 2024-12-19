document.getElementById('addUserMatchForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        alert("User ID is missing in the URL");
        return;
    }

    const formData = {
        character_id: document.getElementById('characterId').value,
        match_id: document.getElementById('matchId').value,
        kills: document.getElementById('kills').value,
        escaped: document.getElementById('escaped').value === 'true'
    };

    try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}/matches/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            window.location.href = `match_history.html?id=${userId}`;
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error adding user match:', error);
        alert('An error occurred while adding the match.');
    }
});