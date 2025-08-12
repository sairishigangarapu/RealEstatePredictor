from flask import Flask, request, jsonify
import util

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

@app.route('/get_location_names')
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    return response

@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    data = request.get_json()
    total_sqft = float(data['sqft'])
    location = data['location']
    bhk = int(data['bhk'])
    bath = int(data['bath'])
    
    # Get base prediction from 2017 model
    base_price = util.get_estimated_price(location, total_sqft, bhk, bath)
    inflation_factor = 1.50
    adjusted_price = round(base_price * inflation_factor, 2)
    
    response = jsonify({
        'estimated_price': adjusted_price
    })
    return response

if __name__ == "__main__":
    print('Starting Python Flask Server for home price prediction')
    util.load_saved_artifacts()
    app.run(debug=True, port=5000)