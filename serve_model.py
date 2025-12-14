import os
import logging
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS
from typing import Optional, Any

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

# Paths (can be overridden via env)
MODEL_PATH = Path(os.environ.get("MODEL_PATH", "models/best_model.pkl"))
SCALER_PATH = Path(os.environ.get("SCALER_PATH", "models/scaler.pkl"))
FEATURES_PATH = Path(os.environ.get("FEATURES_PATH", "models/feature_columns.pkl"))

model: Optional[Any] = None
scaler: Optional[Any] = None
feature_cols: Optional[list] = None
logger = logging.getLogger("pm")
logging.basicConfig(level=logging.INFO)

def load_artifacts():
    global model, scaler, feature_cols
    logger.info(f"Loading artifacts from {MODEL_PATH}, {SCALER_PATH}, {FEATURES_PATH}")
    if not (MODEL_PATH.exists() and SCALER_PATH.exists() and FEATURES_PATH.exists()):
        raise FileNotFoundError("One or more model artifacts missing")
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_cols = joblib.load(FEATURES_PATH)
    logger.info("Artifacts loaded.")

# utility: scale and predict
def scale_and_predict(X_df: pd.DataFrame):
    # X_df: pandas DataFrame with columns matching feature_cols (or a subset)
    global scaler, model, feature_cols
    assert scaler is not None, "Scaler is not loaded"
    assert model is not None, "Model is not loaded"
    assert feature_cols is not None, "Feature columns are not loaded"
    # Align features to expected order and fill missing with 0
    X = X_df.reindex(columns=feature_cols, fill_value=0)
    X_np = X.to_numpy(dtype=float)
    X_scaled = scaler.transform(X_np)
    probs = model.predict_proba(X_scaled)[:, 1]
    preds = (probs >= 0.5).astype(int)
    out = []
    for i, p in enumerate(probs):
        out.append({"probability": float(p), "prediction": int(preds[i])})
    return out

# health endpoint (compatible with your repo)
@app.route("/health", methods=["GET"])
def health():
    ok = True
    try:
        if not (MODEL_PATH.exists() and SCALER_PATH.exists() and FEATURES_PATH.exists()):
            ok = False
        else:
            # try load to ensure they are readable
            _m = joblib.load(MODEL_PATH)
            _s = joblib.load(SCALER_PATH)
            _f = joblib.load(FEATURES_PATH)
            del _m, _s, _f
    except Exception as e:
        logger.exception("Health check load failed")
        ok = False
    return jsonify({"ok": ok}), (200 if ok else 503)

@app.route("/model/info", methods=["GET"])
def model_info():
    global model, scaler, feature_cols
    if model is None or scaler is None or feature_cols is None:
        return jsonify({"error": "Model artifacts not loaded"}), 503
    info = {
        "name": "Predictive Maintenance Model",
        "version": "1.0.0",
        "artifacts": [str(MODEL_PATH), str(SCALER_PATH), str(FEATURES_PATH)],
        "trained_at": "2025-01-01T00:00:00Z",
        "feature_columns": feature_cols,
    }
    return jsonify(info), 200

@app.route("/")
def home():
    # Serve the static frontend index.html
    return app.send_static_file("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    global model, scaler, feature_cols
    if model is None or scaler is None or feature_cols is None:
        return jsonify({"error": "Model artifacts not loaded"}), 503

    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400

    # Support two input forms:
    # 1) single dict of feature_name: value
    # 2) list of dicts for batch
    rows = None
    if isinstance(data, dict):
        # may contain "rows" key or be direct feature dict
        if "rows" in data and isinstance(data["rows"], list):
            rows = data["rows"]
        else:
            rows = [data]
    elif isinstance(data, list):
        rows = data
    else:
        return jsonify({"error": "JSON payload must be an object or list"}), 400

    # Build DataFrame
    try:
        X = pd.DataFrame(rows)
    except Exception:
        return jsonify({"error": "Could not parse rows into DataFrame"}), 400

    # Basic validation: ensure at least one sensor col present
    if X.shape[0] == 0:
        return jsonify({"error": "No rows provided"}), 400

    try:
        out = scale_and_predict(X)
    except Exception as e:
        logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed", "detail": str(e)}), 500

    # If single input, return single object
    if len(out) == 1:
        return jsonify(out[0]), 200
    return jsonify({"predictions": out}), 200

if __name__ == "__main__":
    # If artifacts are present on disk, load now (for development server).
    try:
        load_artifacts()
    except Exception as e:
        logger.warning(f"Artifacts not loaded at startup: {e}")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)