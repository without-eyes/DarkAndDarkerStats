document.addEventListener("DOMContentLoaded", () => {
    // Форма оновлення акаунту
    const form = document.getElementById("accountForm");
    const message = document.getElementById("message");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const data = { username };
            if (email) data.email = email;
            if (password) data.password = password;

            try {
                const response = await fetch("http://localhost:5000/api/user/update", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    message.innerHTML = `<div class="error">Error: ${errorText}</div>`;
                    return;
                }

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();
                    message.innerHTML = response.ok
                        ? `<div class="success">Account updated successfully!</div>`
                        : `<div class="error">Error: ${result.message}</div>`;
                } else {
                    message.innerHTML = `<div class="error">Unexpected response from server</div>`;
                }
            } catch (error) {
                message.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
        });
    }

    // Деталі персонажа
    async function getCharacterDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('id');
        const userId = urlParams.get('userId');

        if (!characterId || !userId) {
            console.error('Character ID or User ID is missing in URL');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/user/${userId}/characters/${characterId}`);
            if (!response.ok) throw new Error('Failed to fetch character details');
            const character = await response.json();
            document.getElementById('characterName').textContent = character.name;
            document.getElementById('characterLevel').textContent = `Level: ${character.level}`;
            document.getElementById('characterClass').textContent = `Class: ${character.class}`;
        } catch (error) {
            console.error('Error fetching character details:', error);
        }
    }

    // Навігація
    function navigateTo(page) {
        window.location.href = page;
    }

    // Логін
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    window.location.href = 'index.html';
                } else {
                    const result = await response.json();
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        });
    }

    // Деталі матчу
    async function getMatchDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId = urlParams.get('id');

        try {
            const response = await fetch(`http://localhost:5000/api/match/${matchId}`);
            if (!response.ok) throw new Error('Failed to fetch match details');
            const match = await response.json();
            document.getElementById('matchId').textContent = `Match #${match.match_id}`;
            document.getElementById('matchDate').textContent = `Date: ${match.start_time} to ${match.end_time}`;
            document.getElementById('matchKills').textContent = `Kills: ${match.kills}`;
            document.getElementById('matchEscaped').textContent = `Escaped: ${match.escaped}`;
        } catch (error) {
            console.error('Error fetching match details:', error);
            document.getElementById('matchId').textContent = 'Error fetching match details';
        }
    }

    // Історія матчів
    async function getMatchHistory() {
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
    }

    // Дані користувача
    async function getUserData() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');

        if (!userId) {
            console.error('User ID is missing in URL');
            return;
        }

        try {
            const userResponse = await fetch(`http://localhost:5000/api/user/${userId}`);
            if (!userResponse.ok) throw new Error('Failed to fetch user data');
            const user = await userResponse.json();
            document.getElementById('username').textContent = user.username;
            document.getElementById('email').textContent = user.email;

            const charactersResponse = await fetch(`http://localhost:5000/api/user/${userId}/characters`);
            if (!charactersResponse.ok) throw new Error('Failed to fetch characters');
            const characters = await charactersResponse.json();
            const charactersList = document.getElementById('charactersList');
            charactersList.innerHTML = '';

            characters.forEach(character => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="character.html?id=${character.id}">${character.name}</a>`;
                charactersList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Реєстрація
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            if (password !== confirm_password) {
                alert('Passwords do not match!');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                if (response.ok) {
                    window.location.href = 'login.html';
                } else {
                    const result = await response.json();
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
});
