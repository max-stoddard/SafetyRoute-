
import numpy as np
import joblib
from vectorAnalyze import ContextRegressor
from sentence_transformers import SentenceTransformer

# File is old for testing



X_train = np.array([[0.2, 0.5, 0.3, 0.1],
                    [0.1, 0.2, 0.1, 0.3],
                    [0.4, 0.4, 0.2, 0.5]])


y_train = np.array([15, 10, 20])

vectorizer = SentenceTransformer('all-MiniLM-L6-v2')
searchPhraseHigh = "violent aggresor and sexual assault mugged on street, arson, harassment"
searchPhraseMid = "pickpocket, anti social loitering, loud disturbance"
searchPhraseLow = "house robbery, loud disturbance, vandalism, drug"

tableName = "SafeRoute.CrimeDataSample"
searchVectorHigh = vectorizer.encode(searchPhraseHigh, normalize_embeddings=True).tolist()
# Define the SQL query with placeholders for the vector and limit
sql = f"""
    SELECT TOP ? ContextVector
    FROM {tableName}
    ORDER BY VECTOR_DOT_PRODUCT(description_vector, TO_VECTOR(?)) DESC
    """




numberOfResults = 100

cursor.execute(sql, [numberOfResults, str(searchVectorHigh)])

results = cursor.fetchall()
print(results)



model = ContextRegressor()
model.train(X_train, y_train)
joblib.dump(model, "crime_model.pkl")


X_new = np.array([[0.3, 0.6, 0.2, 0.4]])
predictions = model.predict(X_new)


print("Predicted Score: ", predictions[0])