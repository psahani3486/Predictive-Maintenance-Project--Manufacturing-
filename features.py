"""
features.py
Create rolling-window features from telemetry per machine.
We produce per-cycle aggregated features for classification of imminent failure:
Goal: For each cycle create features that help predict whether a failure occurs within the next K cycles.
"""
import pandas as pd
import numpy as np
from tqdm import tqdm

def create_rolling_features(df, window_sizes=[5, 10, 20], lag_features=[1,3,5], target_horizon=5):
    """
    df: raw telemetry with columns: machine_id, cycle, sensor_*
    returns aggregated dataset with labels: failure_within_horizon (1 if failure occurs within next target_horizon cycles)
    Approach:
    - For each machine, compute rolling mean/std/min/max of sensors for window sizes
    - Add lagged sensor values
    - Label each row if there's a failure in next target_horizon cycles
    """
    sensor_cols = [c for c in df.columns if c.startswith("sensor_")]
    machines = df['machine_id'].unique()
    features = []
    for m in tqdm(machines, desc="machines"):
        sub = df[df['machine_id'] == m].copy()
        sub = sub.sort_values('cycle').reset_index(drop=True)
        # create rolling stats
        for w in window_sizes:
            rolled = sub[sensor_cols].rolling(window=w, min_periods=1)
            for col in sensor_cols:
                sub[f"{col}_rollmean_{w}"] = rolled[col].mean()
                sub[f"{col}_rollstd_{w}"] = rolled[col].std().fillna(0)
                sub[f"{col}_rollmin_{w}"] = rolled[col].min()
                sub[f"{col}_rollmax_{w}"] = rolled[col].max()
        # lags
        for l in lag_features:
            for col in sensor_cols:
                sub[f"{col}_lag_{l}"] = sub[col].shift(l)
        # delta features (current - lag1)
        for col in sensor_cols:
            sub[f"{col}_delta_1"] = sub[col] - sub[f"{col}_lag_1"]
        # target: failure within next target_horizon cycles
        # compute whether any failure occurs in the NEXT `target_horizon` cycles (explicit look-ahead)
        fw = np.zeros(len(sub), dtype=int)
        fail_idx = sub.index[sub['failure'] == 1].tolist()
        for i in range(len(sub)):
            # check if any failure index is in (i+1) .. (i+target_horizon)
            start = i + 1
            end = i + target_horizon
            # if any failure index falls in that future window, set flag
            for fidx in fail_idx:
                if start <= fidx <= end:
                    fw[i] = 1
                    break
        sub['failure_within_horizon'] = fw
        # keep features (drop raw failure since we use derived label)
        features.append(sub)
    df_feat = pd.concat(features, ignore_index=True)
    # After concatenation, drop rows with NaN introduced by lagging at beginnings
    df_feat = df_feat.dropna(axis=0, subset=[c for c in df_feat.columns if "lag" in c])
    # drop columns we don't need for model
    cols_to_drop = ['timestamp', 'failure']  # keep 'cycle' maybe not needed
    existing_drop = [c for c in cols_to_drop if c in df_feat.columns]
    df_feat = df_feat.drop(columns=existing_drop)
    return df_feat

if __name__ == "__main__":
    # smoke test
    df = pd.read_csv("machine_data_1000.csv", parse_dates=["timestamp"])
    df_clean = df.sort_values(['machine_id', 'cycle'])
    feat = create_rolling_features(df_clean, window_sizes=[5,10], lag_features=[1,3], target_horizon=5)
    print(feat.shape)
    print(feat.columns[:20])