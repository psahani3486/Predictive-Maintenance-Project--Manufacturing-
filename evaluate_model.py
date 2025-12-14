"""
evaluate_model.py
Load model and run a thorough evaluation including confusion matrix, classification report,
and SHAP explainability on a holdout sample.
"""
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, average_precision_score
import matplotlib.pyplot as plt
import seaborn as sns
import shap
from preprocessing import load_data, basic_cleaning
from features import create_rolling_features
from sklearn.model_selection import GroupShuffleSplit

def load_artifacts():
    model = joblib.load("models/best_model.pkl")
    scaler = joblib.load("models/scaler.pkl")
    feature_cols = joblib.load("models/feature_columns.pkl")
    return model, scaler, feature_cols

def prepare_holdout(df_path, horizon=5, test_size=0.2):
    df = load_data(df_path)
    df = basic_cleaning(df)
    df = create_rolling_features(df, window_sizes=[5,10,20], lag_features=[1,3,5], target_horizon=horizon)
    # split by machine for holdout
    machines = df['machine_id'].unique()
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=42)
    train_idx, test_idx = next(gss.split(machines, groups=machines))
    test_machines = machines[test_idx]
    test_df = df[df['machine_id'].isin(test_machines)].reset_index(drop=True)
    return test_df

def evaluate(df_test, model, scaler, feature_cols):
    target = "failure_within_horizon"
    X_test = df_test[feature_cols]
    y_test = df_test[target].values
    X_test_scaled = scaler.transform(X_test)
    probs = model.predict_proba(X_test_scaled)[:,1]
    preds = (probs >= 0.5).astype(int)
    print("ROC AUC:", roc_auc_score(y_test, probs))
    print("Average precision (PR AUC):", average_precision_score(y_test, probs))
    print("Classification report:\n", classification_report(y_test, preds))
    cm = confusion_matrix(y_test, preds)
    plt.figure(figsize=(5,4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.show()
    return X_test, y_test, probs

def shap_explain(model, X_sample_scaled, X_sample, feature_names, nsamples=200):
    # Use TreeExplainer if tree-based
    try:
        explainer = shap.TreeExplainer(model)
    except Exception:
        explainer = shap.Explainer(model.predict, X_sample_scaled)
    shap_values = explainer.shap_values(X_sample_scaled) if hasattr(explainer, "shap_values") else explainer(X_sample_scaled).values
    # For binary, shap_values is list [neg, pos] for TreeExplainer; pick pos index 1
    if isinstance(shap_values, list):
        shap_v = shap_values[1]
    else:
        shap_v = shap_values
    shap.summary_plot(shap_v, X_sample, feature_names=feature_names, show=True)

if __name__ == "__main__":
    model, scaler, feature_cols = load_artifacts()
    df_test = prepare_holdout("data/synthetic_machinery.csv", horizon=5, test_size=0.2)
    X_test, y_test, probs = evaluate(df_test, model, scaler, feature_cols)
    # sample subset for SHAP due to speed
    sample_idx = np.random.choice(len(X_test), size=min(500, len(X_test)), replace=False)
    X_sample = X_test.iloc[sample_idx]
    X_sample_scaled = scaler.transform(X_sample)
    shap_explain(model, X_sample_scaled, X_sample, feature_cols)