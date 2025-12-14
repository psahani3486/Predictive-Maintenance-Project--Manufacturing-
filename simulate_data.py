"""
simulate_data.py
Generates synthetic telemetry data for multiple machines with occasional failures.
Produces CSV with columns: timestamp, machine_id, cycle, sensor_1...sensor_n, failure (0/1)
"""
import numpy as np
import pandas as pd
from pathlib import Path
import argparse
import random
from datetime import datetime, timedelta

def simulate_machine(machine_id, n_cycles=2000, seed=None):
    """
    Simulate telemetry for a single machine.
    We simulate gradual degradation in some sensors and occasional spikes/noise.
    We'll produce an RUL (remaining useful life) concept and mark a failure when degradation crosses threshold.
    """
    if seed is not None:
        np.random.seed(seed + int(machine_id))
    cycles = np.arange(n_cycles)
    timestamps = [datetime.now() - timedelta(minutes=(n_cycles - i)) for i in range(n_cycles)]
    # Sensors: baseline + noise + degradation trend
    sensor_1 = 50 + 0.01 * cycles + np.random.normal(0, 0.5, n_cycles)  # slowly drifting
    sensor_2 = 80 + 0.005 * cycles + np.random.normal(0, 1.0, n_cycles)
    sensor_3 = 100 + np.sin(cycles / 50.0) * 2 + np.random.normal(0, 0.3, n_cycles)  # cyclic
    sensor_4 = 30 + (cycles ** 0.5) * 0.1 + np.random.normal(0, 0.2, n_cycles)
    sensor_5 = 250 + np.random.normal(0, 5, n_cycles)  # noisy but stationary

    # Degradation combined signal
    degradation = 0.02 * cycles + np.random.normal(0, 0.5, n_cycles)
    # Choose failure cycle randomly per machine but biased to later cycles
    failure_cycle = int(n_cycles * np.clip(np.random.beta(2, 20), 0.1, 0.95))
    # Safety: some machines may not fail within this simulation window
    will_fail = np.random.rand() < 0.6  # 60% machines fail
    failure_signal = np.zeros(n_cycles, dtype=int)
    if will_fail:
        # increase sensors after failure point to simulate warning signs
        fail_idx = failure_cycle
        sensor_1[fail_idx:] += np.linspace(0, 10, n_cycles - fail_idx)
        sensor_2[fail_idx:] += np.linspace(0, 20, n_cycles - fail_idx)
        # Mark one failure event at fail_idx
        failure_signal[fail_idx] = 1

    df = pd.DataFrame({
        "timestamp": timestamps,
        "machine_id": f"machine_{machine_id}",
        "cycle": cycles,
        "sensor_1": sensor_1,
        "sensor_2": sensor_2,
        "sensor_3": sensor_3,
        "sensor_4": sensor_4,
        "sensor_5": sensor_5,
        "failure": failure_signal
    })
    return df

def generate_dataset(n_machines=50, cycles_per_machine=2000, out_path="machine_data_1000.csv", seed=42):
    np.random.seed(seed)
    rows = []
    for m in range(n_machines):
        dfm = simulate_machine(m, n_cycles=cycles_per_machine, seed=seed)
        rows.append(dfm)
    data = pd.concat(rows, ignore_index=True)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    data.to_csv(out_path, index=False)
    print(f"Saved synthetic dataset to {out_path}, shape={data.shape}")
    return out_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--machines", type=int, default=50)
    parser.add_argument("--cycles", type=int, default=2000)
    parser.add_argument("--out", type=str, default="machine_data_1000.csv")
    args = parser.parse_args()
    generate_dataset(n_machines=args.machines, cycles_per_machine=args.cycles, out_path=args.out)