    
import math
import time

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
# from safeRouteCrimeAnalysis import AnalyzeSegments


# from xgboost import XGBRegressor
# import numpy as np
import requests
import polyline
import os

app = Flask(__name__)
CORS(app)
load_dotenv()

# model = XGBRegressor()
# try:
#     model.load_model("src\\python\\crime_score_regressor.JSON")
# except AttributeError as e:
#     pass

@app.route('/api/calculate_route/<startlat>/<startlong>/<endlat>/<endlong>', methods=['GET'])
def calculate_route(startlat, startlong, endlat, endlong):
    startTime = time.time()
    print(f"Calculating best path from Lat1: {startlat}, Long1: {startlong} to Lat1: {endlat}, Long1: {endlong}")

    (routes, formattedRoutes) = find_routes((startlat, startlong), (endlat, endlong))
    print(f"{len(routes)} Routes found in {time.time() - startTime}")
    tempTime = time.time()

    routeScores = []
        
    # i = 1
    # formattedRoutes = formattedRoutes[:4]
    # for route in formattedRoutes:
    #
    #
    #     result = AnalyzeSegments(route)
    #     print(f"A {i} analyzed in {time.time() - tempTime}")
    #     tempTime = time.time()
    #     scores = create_list_of_scores(result)
    #     print(f"B {i} analyzed in {time.time() - tempTime}")
    #     tempTime = time.time()
    #     score = create_one_score(scores)
    #     print(f"C {i} analyzed in {time.time() - tempTime}")
    #     tempTime = time.time()
    #     routeScores.append(score)
    #
    #     print(f"Route {i} analyzed in {time.time() - tempTime}")
    #     tempTime = time.time()
    #     i += 1
    #
    # minVal = 9999999999
    # minIndex = 0
    # for i in range(0, len(routeScores)):
    #     if (routeScores[i] < minVal):
    #         minVal = routeScores[i]
    #         minIndex = i
    #
    # print(f"Found all route weights in {time.time() - tempTime}")
    # tempTime = time.time()
    #
    # best = routes[minIndex]
    # print(best)
    #
    google_route_json = [list(coord) for coord in routes[0]]
    safe_route_json = [list(coord) for coord in routes[1]]
    #
    # print(f"Found in total: {time.time() - startTime}")
    #
    return jsonify({
        "google_route": google_route_json,
        "safe_route": safe_route_json
    })

def find_routes(origin, destination):
    api_key = os.environ.get('GOOGLE_API_KEY')
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

    route_coordinates = []

    for route in data.get("routes", []):
        encoded_polyline = route["overview_polyline"]["points"]
        route_coordinates.append(polyline.decode(encoded_polyline))

    route_coordinates = find_more_routes(route_coordinates)

    routes_as_coordinates = []

    for route in route_coordinates:
        route_coordinates_pairs = []
        for i in range(1, len(route)):
            route_coordinates_pairs.append((route[i-1], route[i]))
        routes_as_coordinates.append(route_coordinates_pairs)

    return route_coordinates, list(map(lambda lis: list(map(lambda pair: ((pair[0], pair[1]), math.sqrt(pow(pair[0][0] - pair[1][0], 2) + pow(pair[0][1] - pair[1][1], 2))), lis)), routes_as_coordinates))

# Returns: [(scores: float[], length: float)]
    def create_list_of_scores(result):
        crime_scores = []

        for segment in result:
            length = segment["SegLength"]
            crimes = segment["Crimes"]

            crime_list = []

            for crime in crimes:
                score = calc_score(crime)
                crime_list.append(score)

            crime_scores.append((crime_list, length))

        return crime_scores

    def calc_score(crime):
        mapping = {
            "Robbery": 0.8,
            "Violence and sexual offences": 1.5,
            "Other theft": 1.1,
            "Shoplifting": 0.5,
            "Theft from the person": 1.25,
            "Bicycle theft": 0.7,
            "Drugs": 1,
            "Criminal damage and arson": 1.15,
            "Vehicle crime": 0.8,
            "Anti-social behavior": 1.3,
            "Burglary": 0.7,
            "Public order": 0.7,
            "Other crime": 1,
            "Posession of weapons": 1

        }

        context_vector = np.array([float(x) for x in crime[3].split(',')], dtype=np.float32).reshape(1, -1)

        score = model.predict(context_vector)[0]

        if crime[2] in mapping:
            score = score * mapping[crime[2]]
            if score > 1:
                return 1
        return score


    # scores = [pair(float[], float)]
    def create_one_score(scores):
        mapped = list(map(lambda x: sum(x[0])/(x[1] * 1000), scores))
        return max(mapped)

def find_more_routes(routes):
    new_routes = []
    new_new_routes = []
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise Exception("API_KEY environment variable not set")
    url = "https://maps.googleapis.com/maps/api/directions/json"

    for route in routes:
        third = len(route)//3
        front = route[:third]
        change = route[third:]

        origin = change[0]
        destination = change[len(change) - 1]

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

        for subroute in data.get("routes", []):
            encoded_polyline = subroute["overview_polyline"]["points"]
            new_routes.append(front + polyline.decode(encoded_polyline))

    for route in new_routes:
        third = (len(route) // 3) * 2
        front = route[:third]
        change = route[third:]

        origin = change[0]
        destination = change[len(change) - 1]

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

        for subroute in data.get("routes", []):
            encoded_polyline = subroute["overview_polyline"]["points"]
            new_new_routes.append(front + polyline.decode(encoded_polyline))

    return new_new_routes



if __name__ == '__main__':
    app.run(debug=True)

    # res = calculate_route(51.50036512204452, -0.21100754908843342, 51.49924006441132, -0.18089734791871584)
    #
    # print(res)
