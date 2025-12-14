import joblib
from pathlib import Path

MODEL_PATH = Path('models/best_model.pkl')
SCALER_PATH = Path('models/scaler.pkl')

print('Loading existing artifacts...')
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Backups (will overwrite existing .bak files)
MODEL_BAK = MODEL_PATH.with_suffix('.pkl.bak')
SCALER_BAK = SCALER_PATH.with_suffix('.pkl.bak')

print(f'Backing up {MODEL_PATH} -> {MODEL_BAK}')
MODEL_PATH.replace(MODEL_BAK)

print(f'Backing up {SCALER_PATH} -> {SCALER_BAK}')
SCALER_PATH.replace(SCALER_BAK)

print('Re-saving artifacts with current joblib/sklearn...')
joblib.dump(model, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

print('Resave complete. Originals backed up with .bak suffix.')