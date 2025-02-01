from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/api/calculate_route', methods=['GET'])
def calculate_route():

    find_routes()

    for route in routes:
        create_coordinate_pairs()
        create_list_of_crimes()
        create_list_of_scores()
        create_one_score()

    find_best_route()

    return jsonify({'message': 'GET request successful'})


if __name__ == '__main__':
    app.run(debug=True)
