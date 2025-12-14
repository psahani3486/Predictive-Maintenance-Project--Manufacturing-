import joblib
import pandas as pd
import numpy as np
from preprocessing import load_data, basic_cleaning
from features import create_rolling_features

MODEL_PATH = "models/best_model.pkl"
FEATURES_PATH = "models/feature_columns.pkl"
DATA_PATH = "machine_data_1000.csv"
HORIZON = 5

def main():
    print("Loading and rebuilding features...")
    df = load_data(DATA_PATH)
    dfc = basic_cleaning(df)
    df_feat = create_rolling_features(dfc, window_sizes=[5,10,20], lag_features=[1,3,5], target_horizon=HORIZON)
    feat_cols = joblib.load(FEATURES_PATH)
    print(f"Rebuilt feature frame shape: {df_feat.shape}")
    if 'failure_within_horizon' not in df_feat.columns:
        print("No target column found. Exiting.")
        return
    # use numpy arrays to avoid pandas ExtensionArray typing issues
    y = df_feat['failure_within_horizon'].to_numpy(dtype=int)
    print(f"Positives: {int(y.sum())} / {len(y)} (rate {y.mean():.3f})")

    model = joblib.load(MODEL_PATH)
    importances = model.feature_importances_ if hasattr(model, 'feature_importances_') else None
    if importances is not None and len(importances) == len(feat_cols):
        imp_df = pd.DataFrame({'feature': feat_cols, 'importance': importances})
        imp_df = imp_df.sort_values('importance', ascending=False).reset_index(drop=True)
        print("Top 15 features by importance:")
        print(imp_df.head(15).to_string(index=False))
    else:
        print("Model does not expose feature_importances_ or mismatch with feature list.")

    # compute Pearson correlation with binary target as a quick diagnostic
    X = df_feat[feat_cols].fillna(0)
    corrs = []
    for c in feat_cols:
        try:
            # ensure numeric numpy arrays
            a = X[c].to_numpy(dtype=float)
            b = y.astype(float)
            if np.nanstd(a) == 0 or np.nanstd(b) == 0:
                corr = np.nan
            else:
                corr = np.corrcoef(a, b)[0,1]
        except Exception:
            corr = np.nan
        corrs.append((c, corr))
    corr_df = pd.DataFrame(corrs, columns=['feature','corr']).dropna()
    corr_df['abs_corr'] = corr_df['corr'].abs()
    corr_df = corr_df.sort_values('abs_corr', ascending=False).reset_index(drop=True)
    print("Top 15 features by absolute Pearson correlation with target:")
    print(corr_df.head(15).to_string(index=False))

if __name__ == '__main__':
    main()
