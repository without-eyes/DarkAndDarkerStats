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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password}),
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