#!/bin/bash

echo "Запуск сервісу..."

start_http_server() {
    echo "Запуск HTTP сервера..."
    make
}

start_backend() {
    echo "Запуск бекенду..."
    python src/backend/backend.py
}

if [ "$1" == "http" ]; then
    start_http_server
elif [ "$1" == "backend" ]; then
    start_backend
else
    echo "Використання: $0 [http|backend]"
    echo "  http    - Запустити HTTP сервер"
    echo "  backend - Запустити бекенд"
fi
