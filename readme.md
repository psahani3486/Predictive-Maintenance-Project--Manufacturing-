# Predictive Maintenance Project (Manufacturing)

A complete machine learning solution for predictive maintenance in manufacturing, featuring a Python backend with Flask and a React frontend dashboard. The system predicts machinery failures using sensor data and provides real-time monitoring, single predictions, and batch processing capabilities.

## Features

- **Machine Learning Model**: Random Forest classifier trained on rolling statistics, lagged features, and deltas from sensor telemetry.
- **Backend API**: RESTful Flask API for health checks, model info, and predictions (single or batch).
- **Frontend Dashboard**: Interactive React app with:
  - Single prediction form
  - Batch CSV upload and processing
  - Real-time backend status monitoring
  - Model performance visualization (charts for probabilities, feature importance, PR curves)
- **Data Pipeline**: End-to-end from raw CSV to trained model artifacts.
- **Production Ready**: WSGI support with Waitress for Windows deployment.
- **Explainability**: SHAP integration for model interpretability.

## Project Structure

```
.
├── data/                          # Raw data directory
├── models/                        # Trained model artifacts
│   ├── best_model.pkl            # Trained Random Forest
│   ├── scaler.pkl                # Feature scaler
│   └── feature_columns.pkl       # Feature names
├── pm-frontend/                  # React frontend
│   ├── src/
│   │   ├── api/                  # API client and types
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Dashboard pages
│   │   └── types/                # TypeScript types
│   ├── vite.config.ts            # Vite config with proxy
│   └── package.json
├── tests/                        # Integration tests
├── analysis_model.py             # Model analysis utilities
├── detailed_evaluation.py        # Detailed model evaluation
├── dockerfile                    # Docker setup
├── evaluate_model.py             # Model evaluation script
├── features.py                   # Feature engineering
├── preprocessing.py              # Data preprocessing
├── requirements.txt              # Python dependencies
├── resave_artifacts.py           # Artifact management
├── sample_batch.csv              # Sample batch data
├── serve_model.py                # Flask development server
├── serve_production.py           # Production server runner
├── simulate_data.py              # Synthetic data generation
├── train_model.py                # Model training pipeline
├── utils.py                      # Helper utilities
├── wsgi.py                       # WSGI entrypoint
└── readme.md
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Git

### Backend Setup

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd predictive-maintenance-project
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd pm-frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Return to project root**:
   ```bash
   cd ..
   ```

## Usage

### Data Preparation

1. **Generate synthetic data** (or use your own CSV):
   ```bash
   python simulate_data.py --machines 50 --cycles 2000 --out machine_data_1000.csv
   ```

### Model Training

1. **Train the model**:
   ```bash
   python train_model.py --data_path machine_data_1000.csv --horizon 5
   ```
   This creates model artifacts in the `models/` directory.

2. **Evaluate the model** (optional):
   ```bash
   python evaluate_model.py
   ```
   Generates evaluation metrics, confusion matrix, and SHAP plots.

### Running the Application

#### Development Mode

1. **Start the backend**:
   ```bash
   python serve_model.py
   ```
   Server runs on http://localhost:5000

2. **Start the frontend** (in a new terminal):
   ```bash
   cd pm-frontend
   npm run dev
   ```
   Dashboard available at http://localhost:5173

#### Production Mode

1. **Start the backend**:
   ```bash
   python serve_production.py --port 5000 --threads 4
   ```
   Uses Waitress WSGI server.

2. **Start the frontend** (build for production):
   ```bash
   cd pm-frontend
   npm run build
   npm run preview
   ```
   Or serve the built files with any static server.

### API Usage

#### Health Check
```bash
GET /health
```
Response: `{"ok": true}`

#### Model Info
```bash
GET /model/info
```
Returns model metadata, version, and feature columns.

#### Single Prediction
```bash
POST /predict
Content-Type: application/json

{
  "sensor_1": 0.5,
  "sensor_2": 1.2,
  "sensor_3": 0.8
}
```
Response:
```json
{
  "prediction": 0,
  "probability": 0.234
}
```

#### Batch Prediction
```bash
POST /predict
Content-Type: application/json

[
  {"sensor_1": 0.5, "sensor_2": 1.2},
  {"sensor_1": 1.0, "sensor_2": 0.8}
]
```
Response:
```json
{
  "predictions": [
    {"prediction": 0, "probability": 0.234},
    {"prediction": 1, "probability": 0.789}
  ]
}
```

### Dashboard Features

- **Single Prediction**: Input sensor values manually and get failure predictions.
- **Batch Upload**: Upload CSV files with multiple rows for batch processing.
- **Real-time Monitoring**: Displays backend health status with auto-refresh.
- **Visualization**: Charts for prediction probabilities, feature importance, and PR curves.

## Testing

Run integration tests:
```bash
python -m pytest tests/  # If pytest is configured
# Or directly:
python tests/integration_test.py
```

## Docker Deployment

Build and run with Docker:
```bash
docker build -t pm-app .
docker run -p 5000:5000 pm-app
```

## Configuration

- **Environment Variables**:
  - `MODEL_PATH`: Path to model file (default: models/best_model.pkl)
  - `SCALER_PATH`: Path to scaler file (default: models/scaler.pkl)
  - `FEATURES_PATH`: Path to features file (default: models/feature_columns.pkl)
  - `PORT`: Server port (default: 5000)

- **Model Parameters**: Adjust in `train_model.py` (n_estimators, max_depth, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Notes

- This is a demonstration project. For production use, add authentication, input validation, rate limiting, and monitoring.
- Model performance depends on data quality and feature engineering.
- Adapt the feature engineering in `features.py` for your specific sensor data.
- The frontend proxy configuration assumes backend on localhost:5000.