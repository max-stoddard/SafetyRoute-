import math

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import requests
import polyline
import os

app = Flask(__name__)
CORS(app)
load_dotenv()


@app.route('/api/calculate_route', methods=['GET'])
def calculate_route():
    # Will's routes
    routes = find_routes((1, 1), (1, 1))

    for route in routes:
        create_coordinate_pairs()
        create_list_of_crimes()
        create_list_of_scores()
        create_one_score()

    find_best_route()

    return jsonify({'message': 'GET request successful'})

def find_routes(origin, destination):
    api_key = os.environ.get('API_KEY')
    if not api_key:
        raise Exception("API_KEY environment variable not set")
    url = "https://maps.googleapis.com/maps/api/directions/json"

    params = {
        "origin": f"{origin[0]},{origin[1]}",
        "destination": f"{destination[0]},{destination[1]}",
        "mode": "walking",
        "alternatives": "true",
        "key": api_key
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise Exception(f"Error fetching routes: {response.status_code}")

    data = response.json()

    if data.get("status") != "OK":
        raise Exception(f"API error: {data.get('status')}, {data.get('error_message')}")

    routes_as_coordinates = []

    for route in data.get("routes", []):
        encoded_polyline = route["overview_polyline"]["points"]
        route_coordinates = polyline.decode(encoded_polyline)
        route_coordinates_pairs = []
        for i in range(1, len(route_coordinates)):
            route_coordinates_pairs.append((route_coordinates[i-1], route_coordinates[i]))
        routes_as_coordinates.append(route_coordinates_pairs)

    return list(map(lambda lis: list(map(lambda pair: ((pair[0], pair[1]), math.sqrt(pow(pair[0][0]-pair[1][0], 2) + pow(pair[0][1]-pair[1][1], 2))), lis)), routes_as_coordinates))

def create_coordinate_pairs():
    pass

def create_list_of_coordinate_pairs():
    pass

def create_list_of_crimes():
    pass

def create_list_of_scores():
    pass

# scores = [pair(float[], float)]
def create_one_score(scores):
    mapped = list(map(lambda x: sum(x[0])/x[1], scores))
    return max(mapped)

def find_best_route():
    pass


if __name__ == '__main__':
    routes = find_routes((51.48180, -0.19098), (51.49172, -0.19391))
    for route in routes:
        print(route)
    # app.run(debug=True)
