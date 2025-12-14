"""
train_model.py
Orchestrates preprocessing, feature engineering, train/test split (by machine), model training with hyperparameter search,
and saves best model and scaler.
"""
import argparse
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import GroupShuffleSplit, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, average_precision_score
import joblib
import os
from preprocessing import load_data, basic_cleaning, scale_features
from features import create_rolling_features

def split_by_machine(df, test_size=0.2, random_state=42):
    machines = df['machine_id'].unique()
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    train_idx, test_idx = next(gss.split(machines, groups=machines))
    train_machines = machines[train_idx]
    test_machines = machines[test_idx]
    train_df = df[df['machine_id'].isin(train_machines)].reset_index(drop=True)
    test_df = df[df['machine_id'].isin(test_machines)].reset_index(drop=True)
    return train_df, test_df

def prepare_data(path, target_horizon=5):
    df_raw = load_data(path)
    df_clean = basic_cleaning(df_raw)
    df_feat = create_rolling_features(df_clean, window_sizes=[5,10,20], lag_features=[1,3,5], target_horizon=target_horizon)
    return df_feat

def train_and_select_model(X_train, y_train):
    # baseline: RandomForest with GridSearch
    rf = RandomForestClassifier(random_state=42, n_jobs=-1)
    param_grid = {
        "n_estimators": [100, 200],
        "max_depth": [10, 20, None],
        "min_samples_split": [2, 5],
    }
    grid = GridSearchCV(rf, param_grid, cv=3, scoring="roc_auc", n_jobs=-1, verbose=1)
    grid.fit(X_train, y_train)
    best = grid.best_estimator_
    print("Best params:", grid.best_params_)
    return best, grid

def evaluate_model_on_holdout(model, X_test, y_test):
    p_proba = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, p_proba)
    ap = average_precision_score(y_test, p_proba)
    return {"roc_auc": auc, "avg_precision": ap}

def main(args):
    Path("models").mkdir(exist_ok=True)
    print("Preparing data...")
    df_feat = prepare_data(args.data_path, target_horizon=args.horizon)
    print("Splitting by machine for train/test")
    train_df, test_df = split_by_machine(df_feat, test_size=args.test_size)
    target_col = "failure_within_horizon"
    drop_cols = ["machine_id", "cycle"] if "cycle" in train_df.columns else ["machine_id"]
    X_train = train_df.drop(columns=[target_col] + drop_cols)
    y_train = train_df[target_col]
    X_test = test_df.drop(columns=[target_col] + drop_cols)
    y_test = test_df[target_col]
    print(f"Shape X_train {X_train.shape}, X_test {X_test.shape}, Positives in train {y_train.sum()}, test {y_test.sum()}")

    # scale features
    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test, scaler_path="models/scaler.pkl")

    # train
    print("Training model with GridSearch...")
    best_model, grid = train_and_select_model(X_train_scaled, y_train)
    metrics = evaluate_model_on_holdout(best_model, X_test_scaled, y_test)
    print("Holdout metrics:", metrics)

    # save model & metadata
    joblib.dump(best_model, "models/best_model.pkl")
    joblib.dump(metrics, "models/metrics.pkl")
    # also save column order
    joblib.dump(X_train.columns.tolist(), "models/feature_columns.pkl")
    print("Saved model, scaler, metrics, feature list under models/")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_path", default="machine_data_1000.csv")
    parser.add_argument("--test_size", type=float, default=0.2)
    parser.add_argument("--horizon", type=int, default=5, help="predict failure within next K cycles")
    args = parser.parse_args()
    main(args)