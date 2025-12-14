"""
preprocessing.py
Functions to clean and prepare raw telemetry data for feature engineering.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
from pathlib import Path

def load_data(path):
    df = pd.read_csv(path, parse_dates=["timestamp"])
    return df

def basic_cleaning(df):
    # remove duplicates
    df = df.drop_duplicates()
    # ensure proper dtypes
    df['machine_id'] = df['machine_id'].astype(str)
    df = df.sort_values(['machine_id', 'cycle'])
    # fill tiny missing values per sensor with interpolation
    sensor_cols = [c for c in df.columns if c.startswith("sensor_")]
    # Fix index alignment issue during groupby apply
    df[sensor_cols] = df.groupby('machine_id')[sensor_cols].apply(lambda x: x.interpolate().ffill().bfill()).reset_index(level=0, drop=True)
    # fallback: fill any remaining NaN with median
    df[sensor_cols] = df[sensor_cols].fillna(df[sensor_cols].median())
    return df

def scale_features(X_train, X_test, scaler_path="models/scaler.pkl"):
    Path(scaler_path).parent.mkdir(parents=True, exist_ok=True)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    joblib.dump(scaler, scaler_path)
    return X_train_scaled, X_test_scaled, scaler

if __name__ == "__main__":
    # quick smoke test
    df = load_data("data/synthetic_machinery.csv")
    df = basic_cleaning(df)
    print(df.head())