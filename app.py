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

@app.route('/api/user/update/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email and not password:
        return jsonify({"message": "No fields to update"}), 400

    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        updates = []
        values = []

        if email:
            updates.append('email = %s')
            values.append(email)

        if password:
            updates.append('passwordHash = %s')
            hashed_password = generate_password_hash(password)
            values.append(hashed_password)

        values.append(user_id)

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

@app.route('/api/user/<int:user_id>/characters/add', methods=['POST'])
def add_character(user_id):
    data = request.json
    name = data.get('name')
    char_class = data.get('class')
    level = data.get('level', 1)

    if not name or not char_class:
        return jsonify({"message": "Name and class are required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO characters (user_id, name, class, level) VALUES (%s, %s, %s, %s)",
            (user_id, name, char_class, level)
        )
        connection.commit()
        character_id = cursor.lastrowid
        return jsonify({"message": "Character created successfully", "character_id": character_id}), 201
    finally:
        cursor.close()
        connection.close()

@app.route('/api/user/<int:user_id>/characters/delete/<int:character_id>', methods=['DELETE'])
def delete_character(user_id, character_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "DELETE FROM characters WHERE user_id = %s AND id = %s",
            (user_id, character_id)
        )
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Character not found"}), 404

        return jsonify({"message": "Character deleted successfully"}), 200
    finally:
        cursor.close()
        connection.close()

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

@app.route('/api/user/<int:user_id>/matches/add', methods=['POST'])
def add_user_match(user_id):
    try:
        data = request.json
        required_fields = ['character_id', 'match_id', 'kills', 'escaped']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()
        query = """
            INSERT INTO user_matches (character_id, match_id, kills, `escaped`)
            VALUES (%s, %s, %s, %s)
        """
        values = (data['character_id'], data['match_id'], data['kills'], data['escaped'])
        cursor.execute(query, values)
        connection.commit()
        match_id = cursor.lastrowid
        return jsonify({"message": "Match added successfully", "match_id": match_id}), 201
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"error": "Unexpected error occurred"}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

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

@app.route('/api/match/add', methods=['POST'])
def add_match():
    data = request.json
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    map_name = data.get('map')

    if not all([start_time, end_time, map_name]):
        return jsonify({"message": "Start time, end time, and map are required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO matches (start_time, end_time, map) VALUES (%s, %s, %s)",
            (start_time, end_time, map_name)
        )
        connection.commit()
        match_id = cursor.lastrowid
        return jsonify({"message": "Match created successfully", "match_id": match_id}), 201
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)