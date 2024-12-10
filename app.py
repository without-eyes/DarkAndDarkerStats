import logging

import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash

import config

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=config.DB_HOST,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME
        )
        logger.info("Database connection established")
        return connection
    except Error as e:
        logger.error(f"Database connection failed: {e}")
        raise

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    logger.info(f"Received registration data: {data}")

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        logger.warning("Registration failed: missing fields")
        return jsonify({"message": "All fields are required"}), 400

    hashed_password = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, email, passwordHash) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        connection.commit()
        logger.info(f"User {username} registered successfully")
    except mysql.connector.IntegrityError:
        logger.warning("Registration failed: username or email already exists")
        return jsonify({"message": "Username or email already exists"}), 400
    finally:
        cursor.close()
        connection.close()
        logger.info("Database connection closed")

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    logger.info(f"Received login data: {data}")

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        logger.warning("Login failed: missing email or password")
        return jsonify({"message": "Email and password are required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if user is None or not check_password_hash(user['passwordHash'], password):
        logger.warning("Login failed: invalid email or password")
        return jsonify({"message": "Invalid email or password"}), 401

    logger.info(f"User {email} logged in successfully")
    return jsonify({"id": user['id']}), 200

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    logger.info(f"Fetching user with ID {user_id}")
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if user is None:
        logger.warning(f"User with ID {user_id} not found")
        return jsonify({"message": "User not found"}), 404

    logger.info(f"User with ID {user_id} fetched successfully")
    return jsonify(user)

@app.route('/api/user/update', methods=['PATCH'])
def update_user():
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username:
        return jsonify({"message": "Username is required"}), 400

    connection = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Формуємо оновлення динамічно
        updates = []
        values = []

        if email:
            updates.append('email = %s')
            values.append(email)

        if password:
            updates.append('passwordHash = %s')
            hashed_password = generate_password_hash(password)
            values.append(hashed_password)

        if not updates:
            return jsonify({"message": "No fields to update"}), 400

        values.append(username)

        query = f"UPDATE users SET {', '.join(updates)} WHERE username = %s"
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
        SELECT m.id AS match_id, m.start_time, m.end_time, m.map, 
               um.kills, um.escaped 
        FROM matches m
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
    cursor.execute('''
        SELECT m.id AS match_id, m.start_time, m.end_time, m.map,
               um.kills, um.escaped, um.character_id 
        FROM matches m
        JOIN user_matches um ON m.id = um.match_id
        WHERE m.id = %s
    ''', (match_id,))
    match = cursor.fetchone()
    cursor.close()
    connection.close()

    if match is None:
        return jsonify({"message": "Match not found"}), 404

    return jsonify(match)

if __name__ == '__main__':
    app.run(debug=True, port=5000)