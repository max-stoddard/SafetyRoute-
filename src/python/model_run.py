
import numpy as np 
import joblib
from vectorAnalyze import ContextRegressor


X_train = np.array([[0.2, 0.5, 0.3, 0.1],
                    [0.1, 0.2, 0.1, 0.3],
                    [0.4, 0.4, 0.2, 0.5]])


y_train = np.array([15, 10, 20])

model = ContextRegressor()
model.train(X_train, y_train)
joblib.dump(model, "crime_model.pkl")

X_new = np.array([[0.3, 0.6, 0.2, 0.4]])
predictions = model.predict(X_new)


print("Predicted Score: ", predictions[0])