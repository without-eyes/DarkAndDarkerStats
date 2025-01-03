document.addEventListener("DOMContentLoaded", async () => {
    async function getUserData() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');

        if (!userId) {
            console.error('User ID is missing in URL');
            return;
        }

        try {
            const userResponse = await fetch(`http://localhost:5000/api/user/${userId}`);
            if (!userResponse.ok) throw new Error(`Failed to fetch user data: ${userResponse.status}`);
            const user = await userResponse.json();

            document.getElementById('username').textContent = user.username || 'Unknown';
            document.getElementById('email').textContent = user.email || 'Unknown';
            document.getElementById('member-since').textContent = user.created_at || 'Unknown';

            const charactersResponse = await fetch(`http://localhost:5000/api/user/${userId}/characters`);
            if (!charactersResponse.ok) throw new Error(`Failed to fetch characters: ${charactersResponse.status}`);
            const characters = await charactersResponse.json();

            const charactersList = document.getElementById('charactersList');
            charactersList.innerHTML = '';
            characters.slice(0, 5).forEach(character => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="character.html?userId=${userId}&id=${character.id}">${character.name}</a>`;
                charactersList.appendChild(li);
            });

            if (characters.length > 5) {
                const li = document.createElement('li');
                li.innerHTML = `<a>...</a>`;
                charactersList.appendChild(li);
            }

            const matchesResponse = await fetch(`http://localhost:5000/api/user/${userId}/matches`);
            if (!matchesResponse.ok) throw new Error(`Failed to fetch match history: ${matchesResponse.status}`);
            const matches = await matchesResponse.json();

            const matchesList = document.getElementById('matchesList');
            matchesList.innerHTML = '';
            matches.slice(0, 5).forEach(match => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="match.html?userId=${userId}&id=${match.match_id}">Match #${match.match_id} - ${match.map}</a>`;
                matchesList.appendChild(li);
            });

            if (matches.length > 5) {
                const li = document.createElement('li');
                li.innerHTML = `<a>...</a>`;
                matchesList.appendChild(li);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('Error loading data. Please try again later.');
        }
    }

    await getUserData();
});

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');
if (userId) {
    const matchHistoryButton = document.getElementById('matchHistoryButton');
    matchHistoryButton.onclick = () => {
        location.href = `./match_history.html?id=${userId}`;
    };

    const updateButton = document.getElementById('updateButton');
    updateButton.onclick = () => {
        location.href = `./update.html?id=${userId}`;
    };

    const charactersButton = document.getElementById('charactersButton');
    charactersButton.onclick = () => {
        location.href = `./characters.html?id=${userId}`;
    };
} else {
    console.error("User ID is missing in the URL");
}