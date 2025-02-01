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

def find_routes():
    pass

def create_coordinate_pairs():
    pass

def create_list_of_coordinate_pairs():
    pass

def create_list_of_crimes():
    pass

def create_list_of_scores():
    pass

def create_one_score():
    pass

def find_best_route():
    pass


if __name__ == '__main__':
    app.run(debug=True)
