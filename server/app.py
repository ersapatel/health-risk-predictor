from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app)

model = joblib.load("health_risk_model_1.pkl")


def encode_smoking(smoking: str) -> int:
    return 1 if str(smoking).strip().lower() == "yes" else 0


def encode_exercise(exercise_level: str) -> int:
    value = str(exercise_level).strip().lower()

    mapping = {
        "none": 0,
        "low": 1,
        "moderate": 2,
        "medium": 2,
        "high": 3
    }

    return mapping.get(value, 1)


def decode_risk(prediction: int) -> str:
    return "High Risk" if int(prediction) == 1 else "Low Risk"


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

        features = np.array([[age, bmi, smoking_encoded, exercise_encoded]])

        prediction = model.predict(features)[0]
        risk_level = decode_risk(prediction)

        response = {
            "age": age,
            "bmi": bmi,
            "riskLevel": risk_level
        }

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(features)[0]
            confidence = round(float(max(probabilities)) * 100, 2)
            response["confidence"] = confidence

        return jsonify(response)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, host="0.0.0.0", port=port)