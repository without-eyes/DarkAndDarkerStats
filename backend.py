from flask import Flask, jsonify
from flask_cors import CORS
from flask import Response

app = Flask(__name__)
CORS(app)  # Дозволяє запити з інших доменів

@app.route('/message')
def message():
    message_data = {"message": "Привіт, це повідомлення від бекенду!"}
    response = jsonify(message_data)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5000)
