
import joblib
import numpy as np


def calc(crime):

    score = 0

    mapping = {
        "Robbery": 1.2,
        "Violence and sexual offences": 1.8,
        "Other theft": 1.2,
        "Shoplifting": 0.6,
        "Theft from the person": 1.3,
        "Bicycle theft": 0.5,
        "Drugs": 0.8,
        "Criminal damage and arson": 0.8,
        "Vehicle crime": 0.4,
        "Anti-social behavior": 1.5,
        "Burglary": 0.4,
        "Public order": 0.7,
        "Other Crime": 1,
        "Posession of weapons": 0.7,
    }

    score += mapping[crime["Crime type"]]

    vectors = crime["Vectorized description"]

    model = joblib.load("crime_model.pkl")

    score *= model.predict(vectors)

    normalised_score = 1 / (1 + np.exp(-score))


    return normalised_score



