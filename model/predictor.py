import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import matplotlib
import json
import pickle

# Corrected and new sklearn imports
from sklearn.model_selection import train_test_split, ShuffleSplit, cross_val_score, GridSearchCV
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.tree import DecisionTreeRegressor # Changed from Classifier to Regressor

# =============================================================================
# Helper Functions
# =============================================================================

def is_float(x):
    """Checks if a value can be converted to a float."""
    try:
        float(x)
        return True
    except (ValueError, TypeError):
        return False

def convert_sqft_to_numeric(x):
    """
    Converts a value from the 'total_sqft' column into a single float.
    Handles ranges, various units, and returns np.nan for unparseable strings.
    """
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).lower().strip()
    try:
        if '-' in s:
            parts = [float(p.strip()) for p in s.split('-')]
            return (parts[0] + parts[1]) / 2
        elif 'sq. meter' in s:
            return float(s.replace('sq. meter', '').strip()) * 10.7639
        elif 'perch' in s:
            return float(s.replace('perch', '').strip()) * 272.25
        elif 'acre' in s:
            return float(s.replace('acre', '').strip()) * 43560.0
        elif 'cent' in s:
            return float(s.replace('cent', '').strip()) * 435.6
        elif 'sq. yard' in s:
            return float(s.replace('sq. yard', '').strip()) * 9.0
        elif 'ground' in s:
            return float(s.replace('ground', '').strip()) * 2400.0
        else:
            return float(s)
    except (ValueError, IndexError):
        return np.nan

def remove_pps_outliers(df):
    """
    Removes outliers based on price_per_sqft for each location.
    Keeps data points that are within one standard deviation of the mean for that location.
    """
    df_out = df.copy()
    df_out['price_per_sqft_mean'] = df.groupby('location')['price_per_sqft'].transform('mean')
    df_out['price_per_sqft_std'] = df.groupby('location')['price_per_sqft'].transform('std').fillna(0)
    
    upper_bound = df_out['price_per_sqft_mean'] + df_out['price_per_sqft_std']
    lower_bound = df_out['price_per_sqft_mean'] - df_out['price_per_sqft_std']
    
    df_filtered = df_out[(df_out.price_per_sqft <= upper_bound) & (df_out.price_per_sqft >= lower_bound)]
    df_final = df_filtered.drop(columns=['price_per_sqft_mean', 'price_per_sqft_std'])
    
    return df_final

def remove_bhk_outliers(df):
    """
    Removes properties where for the same location, the price_per_sqft of an N-BHK property
    is less than the mean price_per_sqft of an (N-1)-BHK property.
    """
    exclude_indices = np.array([])
    for location, location_df in df.groupby('location'):
        bhk_stats = {}
        for bhk, bhk_df in location_df.groupby('bhk'):
            bhk_stats[bhk] = {
                'mean': np.mean(bhk_df.price_per_sqft),
                'std': np.std(bhk_df.price_per_sqft),
                'count': bhk_df.shape[0]
            }
        for bhk, bhk_df in location_df.groupby('bhk'):
            stats_prev_bhk = bhk_stats.get(bhk - 1)
            if stats_prev_bhk and stats_prev_bhk['count'] > 5:
                outlier_indices = bhk_df[bhk_df.price_per_sqft < stats_prev_bhk['mean']].index.values
                exclude_indices = np.append(exclude_indices, outlier_indices)
    return df.drop(exclude_indices, axis='index')

def plot_scatter_chart(df, location):
    """Plots a scatter chart comparing 2 BHK and 3 BHK properties for a given location."""
    bhk2 = df[(df.location == location) & (df.bhk == 2)]
    bhk3 = df[(df.location == location) & (df.bhk == 3)]
    
    plt.figure(figsize=(15, 10))
    plt.scatter(bhk2.total_sqft, bhk2.price, color='blue', label='2 BHK', s=50)
    plt.scatter(bhk3.total_sqft, bhk3.price, marker='+', color='green', label='3 BHK', s=50)
    
    plt.xlabel("Total Square Feet Area")
    plt.ylabel("Total Price (in Lakhs)")
    plt.title(f"2 BHK vs 3 BHK Properties in {location}")
    plt.legend()
    plt.grid(True)
    plt.show()

def find_best_model_using_gridsearchcv(X, y):
    """
    Finds the best regression model and its hyperparameters using GridSearchCV.
    """
    # Note: 'normalize' is deprecated for LinearRegression.
    # DecisionTreeClassifier is for classification, using DecisionTreeRegressor instead.
    algos = {
        'linear_regression': {
            'model': LinearRegression(),
            'params': {} # No hyperparameters to tune for basic Linear Regression here
        },
        'lasso': {
            'model': Lasso(),
            'params': {
                'alpha': [1, 2],
                'selection': ['random', 'cyclic']
            }
        },
        'decision_tree': {
            'model': DecisionTreeRegressor(),
            'params': {
                'criterion': ['squared_error', 'friedman_mse'],
                'splitter': ['best', 'random']
            }
        }
    }
    scores = []
    cv = ShuffleSplit(n_splits=5, test_size=0.2, random_state=0)
    for algo_name, config in algos.items():
        gs = GridSearchCV(config['model'], config['params'], cv=cv, return_train_score=False)
        gs.fit(X, y)
        scores.append({
            'model': algo_name,
            'best_score': gs.best_score_,
            'best_params': gs.best_params_
        })
    return pd.DataFrame(scores, columns=['model', 'best_score', 'best_params'])

# This function is for demonstration after the model is saved.
# It requires the model file and the columns file to be loaded first.
def predict_price(location, sqft, bath, bhk, model, data_columns):
    """
    Predicts the price of a property based on input features.
    """
    try:
        # Find the index of the location column
        loc_index = data_columns.index(location.lower())
    except ValueError:
        # If location is not in columns (e.g., it's an 'other' location), it gets no specific column.
        loc_index = -1

    # Create a zero array with the same number of features as the model was trained on
    x = np.zeros(len(data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    
    # If the location was found in the columns, set its value to 1
    if loc_index >= 0:
        x[loc_index] = 1
        
    # Return the prediction, wrapped in a list
    return model.predict([x])[0]

# =============================================================================
# Main Script Execution
# =============================================================================

# --- 1. Data Loading and Initial Cleaning ---
matplotlib.rcParams['figure.figsize'] = (20, 10)
df_raw = pd.read_csv('Bengaluru_House_Data.csv')
df_raw.columns = df_raw.columns.str.strip()

df1 = df_raw.drop(['area_type', 'availability', 'society', 'balcony'], axis='columns')
df2 = df1.dropna().copy()

# --- 2. Feature Engineering ---
df2['bhk'] = df2['size'].apply(lambda x: int(x.split(' ')[0]))
df2 = df2.drop('size', axis='columns')

df2['total_sqft'] = df2['total_sqft'].apply(convert_sqft_to_numeric)
# *** FIX APPLIED HERE ***: Avoid inplace=True on a slice
df2['total_sqft'] = df2['total_sqft'].fillna(df2['total_sqft'].mean())

df3 = df2.copy()
df3['price_per_sqft'] = (df3['price'] * 100000) / df3['total_sqft']

# --- 3. Location Cleaning ---
df3['location'] = df3['location'].apply(lambda x: x.strip().lower()) # Standardize to lower case
location_stats = df3.groupby('location')['location'].agg('count').sort_values(ascending=False)
location_stats_less_than_10 = location_stats[location_stats <= 10]
df3['location'] = df3['location'].apply(lambda x: 'other' if x in location_stats_less_than_10 else x)

# --- 4. Outlier Removal ---
print(f"Shape before any outlier removal: {df3.shape}")
df4 = df3[~(df3['total_sqft'] / df3['bhk'] < 300)]
print(f"Shape after removing small sqft/bhk outliers: {df4.shape}")
df5 = remove_pps_outliers(df4)
print(f"Shape after removing price_per_sqft outliers: {df5.shape}")
df6 = remove_bhk_outliers(df5)
print(f"Shape after removing BHK outliers: {df6.shape}")
df7 = df6[df6.bath < (df6.bhk + 2)]
print(f"\nShape after removing bathroom outliers: {df7.shape}")

# --- 5. Final Data Preparation for Model ---
df8 = df7.drop(['price_per_sqft'], axis='columns')
dummies = pd.get_dummies(df8.location)
df9 = pd.concat([df8, dummies.drop('other', axis='columns')], axis='columns')
df10 = df9.drop('location', axis='columns')

# --- 6. Model Selection and Training ---
X = df10.drop('price', axis='columns')
y = df10['price']

# Find the best model using GridSearchCV
best_model_df = find_best_model_using_gridsearchcv(X, y)
print("\nGridSearchCV Results:")
print(best_model_df)

# Based on typical results, LinearRegression often performs best for this dataset.
# We will explicitly train a LinearRegression model as our final model.
final_model = LinearRegression()
final_model.fit(X, y) # Train on the full prepared dataset for final deployment

# --- 7. Exporting the Model and Columns ---
# Save the trained model to a pickle file
with open('bangalore_home_prices_model.pickle', 'wb') as f:
    pickle.dump(final_model, f)
print("\nModel saved to bangalore_home_prices_model.pickle")

# Save the feature columns to a JSON file, which is needed for prediction
columns = {
    'data_columns': [col.lower() for col in X.columns]
}
with open('columns.json', 'w') as f:
    json.dump(columns, f)
print("Columns saved to columns.json")
