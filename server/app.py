from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def encode_smoking(smoking: str) -> int:
    return 1 if str(smoking).strip().lower() == "yes" else 0


def encode_exercise(exercise_level: str) -> int:
    value = str(exercise_level).strip().lower()
    mapping = {
        "low": 0,
        "moderate": 1,
        "high": 2
    }
    return mapping.get(value, 1)


# Temporary prediction logic
# Replace this later with real ML model prediction
def predict_risk(age: int, bmi: float, smoking: int, exercise: int) -> str:
    score = 0

    if age > 50:
        score += 2
    elif age > 35:
        score += 1

    if bmi > 30:
        score += 2
    elif bmi > 25:
        score += 1

    if smoking == 1:
        score += 2

    if exercise == 0:   # low
        score += 1
    elif exercise == 2: # high
        score -= 1

    if score >= 5:
        return "High Risk"
    elif score >= 3:
        return "Medium Risk"
    else:
        return "Low Risk"


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Health Risk Predictor Backend is running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        age = int(data.get("age"))
        bmi = float(data.get("bmi"))
        smoking = data.get("smoking")
        exercise = data.get("exercise")

        smoking_encoded = encode_smoking(smoking)
        exercise_encoded = encode_exercise(exercise)

        risk_level = predict_risk(age, bmi, smoking_encoded, exercise_encoded)

        return jsonify({
            "age": age,
            "bmi": bmi,
            "riskLevel": risk_level
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)