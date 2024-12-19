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

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const matchId = urlParams.get('id');
if (userId && matchId) {
    const deleteMatch = document.getElementById('deleteMatch');
    deleteMatch.onclick = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/match/${matchId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.ok) {
                location.href = `./match_history.html?id=${userId}`;
            } else {
                alert(data.error || "Error deleting match");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the match.");
        }
    };

    const deleteUserFromMatch = document.getElementById('deleteUserFromMatch');
    deleteUserFromMatch.onclick = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/${userId}/matches/${matchId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.ok) {
                location.href = `./match_history.html?id=${userId}`;
            } else {
                alert(data.error || "Error removing user from match");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while removing the user from the match.");
        }
    };
} else {
    console.error("User ID is missing in the URL");
}