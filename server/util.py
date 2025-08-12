import json
import pickle
import numpy as np
import pandas as pd

__locations = None
__data_columns = None
__model = None

def get_estimated_price(location , sqft , bhk,bath):
    try:
        loc_index = __data_columns.index(location.lower())
    except:
        loc_index = -1

    # Create a dictionary with proper feature names
    x_dict = {col: 0 for col in __data_columns}
    x_dict['total_sqft'] = sqft
    x_dict['bath'] = bath
    x_dict['bhk'] = bhk
    
    if loc_index >= 0:
        x_dict[__data_columns[loc_index]] = 1
    
    # Convert to DataFrame with proper column names
    x_df = pd.DataFrame([x_dict])
    
    return round(__model.predict(x_df)[0],2)

def get_location_names():
    return __locations

def load_saved_artifacts():
    print("Loading saved artifacts...start")
    global __data_columns
    global __locations

    with open('./artifacts/columns.json','r') as f:
        __data_columns = json.load(f)['data_columns']
        __locations = __data_columns[3:]

    global __model
    with open('./artifacts/bangalore_home_prices_model.pickle','rb') as f:
        __model = pickle.load(f)
    print("Loading Artifacts is ... done")
if __name__ == "__main__":
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price('1st Phase JP Nagar',1000, 3, 3))
    print(get_estimated_price('1st Phase JP Nagar', 1000, 2, 2))
    print(get_estimated_price('Kalhalli', 1000, 2, 2))  # other location
    print(get_estimated_price('Ejipura', 1000, 2, 2))  # other location