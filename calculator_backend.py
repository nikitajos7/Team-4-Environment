from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define emission factors based on EPA data
EMISSION_FACTORS = {
    "Electricity": 0.225,  # kg CO₂ per kWh for CAMX region (California)
    "Diet": {
        "omnivore": 2.5,      # kg CO₂ per meal
        "pescatarian": 2.0,   # kg CO₂ per meal
        "vegetarian": 1.5,    # kg CO₂ per meal
        "vegan": 1.0          # kg CO₂ per meal
    },
    "Waste": 0.275,  # kg CO₂ per kg of waste
    "Transportation": {
        "car": 0.251,  # kg CO₂ per km for car
        "plane": 0.285,  # kg CO₂ per km for plane
        "other": 0.3    # kg CO₂ per km for other transport (generalized)
    }
}


# CO₂ sequestration per tree per year
CO2_PER_TREE_PER_YEAR = 58  # kg CO₂

@app.route('/calculate', methods=['POST'])
def calculate_emissions():
    data = request.json
    print("Received data:", data)  # Debugging

    try:
        electricity_usage = float(data.get("electricity", 0))
        meals_per_day = float(data.get("meals", 2))
        waste_kg = float(data.get("waste", 0))
        diet = data.get("diet", "omnivore")
        
        # Extract transport distances (monthly inputs)
        car_distance = float(data.get("car_distance", 0))
        plane_distance = float(data.get("plane_distance", 0))
        other_distance = float(data.get("other_distance", 0))

        # Annualized values (multiply monthly values by 12)
        yearly_car_distance = car_distance * 12
        yearly_plane_distance = plane_distance * 12
        yearly_other_distance = other_distance * 12

        yearly_meals = meals_per_day * 365
        yearly_waste = waste_kg * 52

        # Calculate emissions
        electricity_emissions = round(EMISSION_FACTORS["Electricity"] * electricity_usage * 12, 2)  
        diet_emissions = round(EMISSION_FACTORS["Diet"].get(diet, 2.5) * yearly_meals, 2)
        waste_emissions = round(EMISSION_FACTORS["Waste"] * yearly_waste, 2)

        # Transportation emissions for each mode (per year)
        car_emissions = round(EMISSION_FACTORS["Transportation"]["car"] * yearly_car_distance, 2)
        plane_emissions = round(EMISSION_FACTORS["Transportation"]["plane"] * yearly_plane_distance, 2)
        other_emissions = round(EMISSION_FACTORS["Transportation"]["other"] * yearly_other_distance, 2)

        # Total transportation emissions for one year
        total_transportation_emissions = round(car_emissions + plane_emissions + other_emissions, 2)

        # Total emissions for one year
        total_emissions = round(electricity_emissions + diet_emissions + waste_emissions + total_transportation_emissions, 2)

        # Trees needed for offset (based on total emissions for one year)
        trees_needed = round(total_emissions / CO2_PER_TREE_PER_YEAR)

        return jsonify({
            "electricity": electricity_emissions,
            "diet": diet_emissions,
            "waste": waste_emissions,
            "car": car_emissions,
            "plane": plane_emissions,
            "other": other_emissions,
            "total_transportation": total_transportation_emissions,
            "total": total_emissions,
            "trees_needed": trees_needed
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)



