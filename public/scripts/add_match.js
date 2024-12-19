document.getElementById('addMatchForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        start_time: document.getElementById('startTime').value,
        end_time: document.getElementById('endTime').value,
        map: document.getElementById('mapName').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/match/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            history.back();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error adding match:', error);
        alert('An error occurred while adding the match.');
    }
});