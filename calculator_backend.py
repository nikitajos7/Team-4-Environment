from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define emission factors based on EPA data
EMISSION_FACTORS = {
    "Electricity": 0.225,  # kg CO₂ per kWh for CAMX region
    "Transportation": 0.251,  # kg CO₂ per km
    "Diet": {
        "omnivore": 2.5,      # kg CO₂ per meal
        "pescatarian": 2.0,   # kg CO₂ per meal
        "vegetarian": 1.5,    # kg CO₂ per meal
        "vegan": 1.0          # kg CO₂ per meal
    },
    "Waste": 0.275  # kg CO₂ per kg of waste
}

# CO₂ sequestration per tree per year
CO2_PER_TREE_PER_YEAR = 58  # kg CO₂

@app.route('/calculate', methods=['POST'])
def calculate_emissions():
    data = request.json

    # Extract input values
    vehicle_km = float(data.get("vehicle_km", 0))
    electricity_usage = float(data.get("electricity", 0))
    meals_per_day = float(data.get("meals", 2))
    waste_kg = float(data.get("waste", 0))
    diet = data.get("diet", "omnivore")
    transport = data.get("transport", "private")

    # Annualized values
    yearly_distance = vehicle_km * 365
    yearly_meals = meals_per_day * 365
    yearly_waste = waste_kg * 52

    # Calculate emissions
    transportation_emissions = round(EMISSION_FACTORS["Transportation"] * yearly_distance, 2)
    electricity_emissions = round(EMISSION_FACTORS["Electricity"] * electricity_usage * 12, 2)  # Monthly to yearly
    diet_emissions = round(EMISSION_FACTORS["Diet"].get(diet, 2.5) * yearly_meals, 2)
    waste_emissions = round(EMISSION_FACTORS["Waste"] * yearly_waste, 2)

    total_emissions = round(transportation_emissions + electricity_emissions + diet_emissions + waste_emissions, 2)

    # Trees needed for offset
    trees_needed = round(total_emissions / CO2_PER_TREE_PER_YEAR)

    # Return JSON response
    return jsonify({
        "transportation": transportation_emissions,
        "electricity": electricity_emissions,
        "diet": diet_emissions,
        "waste": waste_emissions,
        "total": total_emissions,
        "trees_needed": trees_needed
    })

if __name__ == '__main__':
    app.run(debug=True)


