from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash

import config

app = Flask(__name__)

def get_db_connection():
    connection = mysql.connector.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME
    )
    return connection

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all([username, email, password, confirm_password]):
        return jsonify({"message": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400

    hashed_password = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, email, passwordHash) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        connection.commit()
    except mysql.connector.IntegrityError:
        return jsonify({"message": "Username or email already exists"}), 400
    finally:
        cursor.close()
        connection.close()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"message": "Email and password are required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user is None or not check_password_hash(user['passwordHash'], password):
        return jsonify({"message": "Invalid email or password"}), 401

    return jsonify({"message": "Login successful", "user": {"id": user['id'], "username": user['username']}}), 200

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if user is None:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user)

@app.route('/api/user/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    data = request.get_json()
    connection = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Збираємо поля для оновлення
        updates = []
        values = []

        if 'username' in data:
            updates.append('username = %s')
            values.append(data['username'])

        if 'email' in data:
            updates.append('email = %s')
            values.append(data['email'])

        if 'passwordHash' in data:
            updates.append('passwordHash = %s')
            values.append(data['passwordHash'])

        if not updates:
            return jsonify({"message": "No fields to update"}), 400

        values.append(user_id)

        # Формуємо запит
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, values)
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "User not found"}), 404

        return jsonify({"message": "User updated successfully"}), 200

    except Error as e:
        print(f"Error: {e}")
        return jsonify({"message": "Database error"}), 500

    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/user/<int:user_id>/characters', methods=['GET'])
def get_user_characters(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM characters WHERE user_id = %s', (user_id,))
    characters = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(characters)

@app.route('/api/user/<int:user_id>/characters/<int:character_id>', methods=['GET'])
def get_character(user_id, character_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM characters WHERE user_id = %s AND id = %s', (user_id, character_id))
    character = cursor.fetchone()
    cursor.close()
    connection.close()

    if character is None:
        return jsonify({"message": "Character not found"}), 404

    return jsonify(character)

@app.route('/api/user/<int:user_id>/matches', methods=['GET'])
def get_user_matches(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('''
        SELECT m.* FROM matches m
        JOIN user_matches um ON m.id = um.match_id
        WHERE um.character_id IN (SELECT id FROM characters WHERE user_id = %s)
    ''', (user_id,))
    matches = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(matches)

@app.route('/api/match/<int:match_id>', methods=['GET'])
def get_match(match_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM matches WHERE id = %s', (match_id,))
    match = cursor.fetchone()
    cursor.close()
    connection.close()

    if match is None:
        return jsonify({"message": "Match not found"}), 404

    return jsonify(match)

if __name__ == '__main__':
    app.run(debug=True)