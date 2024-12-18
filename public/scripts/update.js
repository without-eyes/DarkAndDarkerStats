const form = document.getElementById("accountForm");

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const data = {};
        if (email) data.email = email;
        if (password) data.password = password;

        try {
            const response = await fetch(`http://localhost:5000/api/user/update/${userId}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                window.location.href = `../profile.html?id=${userId}`;
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}