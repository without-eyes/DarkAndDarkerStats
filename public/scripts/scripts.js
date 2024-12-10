{
    const form = document.getElementById("accountForm");
    const message = document.getElementById("message");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const data = {username};
            if (email) data.email = email;
            if (password) data.password = password;

            try {
                const response = await fetch("http://localhost:5000/api/user/update", {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
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
}

function navigateTo(page) {
    window.location.href = page;
}

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

