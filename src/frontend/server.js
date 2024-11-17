// Завантажуємо бібліотеку Express
const express = require('express');
const path = require('path');
const app = express();

// Налаштовуємо порт
const port = 3000;

// Визначаємо маршрут для головної сторінки
app.get('/', (req, res) => {
    // Використовуємо абсолютний шлях до файлу
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Слухаємо на порту 3000
app.listen(port, () => {
    console.log(`Сервер працює на http://localhost:${port}`);
});