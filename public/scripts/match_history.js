document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}/matches`);
        if (!response.ok) throw new Error('Failed to fetch match history');
        const matches = await response.json();
        const matchesList = document.getElementById('matchesList');
        matchesList.innerHTML = '';

        matches.forEach(match => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="match.html?id=${match.match_id}">Match #${match.match_id} - ${match.map}</a>`;
            matchesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching match history:', error);
    }
});