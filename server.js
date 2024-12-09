const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/register', (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (!username || !email || !password || !confirm_password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    res.status(201).json({ message: 'User registered successfully' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}/index.html`);
});