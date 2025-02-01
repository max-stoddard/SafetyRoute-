from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/api/calculate_route', methods=['GET'])
def test():
    return jsonify({'message': 'GET request successful'})


if __name__ == '__main__':
    app.run(debug=True)
