document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    try {
        const response = await fetch(`http://localhost:5000/api/match/${matchId}`);
        if (!response.ok) throw new Error('Failed to fetch match details');
        const match = await response.json();
        document.getElementById('matchId').textContent = `Match #${match.match_id}`;
        document.getElementById('matchMap').textContent = `Map: ${match.map}`;
        document.getElementById('matchDate').textContent = `Date: ${match.start_time} to ${match.end_time}`;
        document.getElementById('matchKills').textContent = `Kills: ${match.kills}`;
        document.getElementById('matchEscaped').textContent = `Escaped: ${match.escaped}`;
    } catch (error) {
        console.error('Error fetching match details:', error);
        document.getElementById('matchId').textContent = 'Error fetching match details';
    }
});