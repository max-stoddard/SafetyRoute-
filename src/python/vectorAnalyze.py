from sklearn.linear_model import LinearRegression
from xgboost import XGBRegressor

class ContextRegressor:
    
    def __init__(self):
        self.model = XGBRegressor(objective = "reg:squarederror", n_estimators = 100,
                                  max_depth = 4, learning_rate = 0.1,
                                  random_state = 42)
    

    def train(self, X, y):
        self.model.fit(X, y)
    
    def predict(self, X):
        return self.model.predict(X)
    

