const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000; // Ви можете змінити порт, якщо потрібно

// Middleware для обробки JSON-запитів
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Встановлюємо папку для статичних файлів (наприклад, ваш front-end)
app.use(express.static(path.join(__dirname, 'public')));

// API для роботи з бекендом
app.post('/api/register', (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (!username || !email || !password || !confirm_password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Тут ви можете додати логіку взаємодії з вашим Flask-бекендом
    res.status(201).json({ message: 'User registered successfully' });
});

// Інші API можна налаштувати аналогічно

// Запускаємо сервер
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}/index.html`);
});
