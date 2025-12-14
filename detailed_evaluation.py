import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc, precision_recall_curve, roc_auc_score, average_precision_score, confusion_matrix, classification_report
from sklearn.model_selection import GroupShuffleSplit
from preprocessing import load_data, basic_cleaning
from features import create_rolling_features

MODEL_PATH = "models/best_model.pkl"
SCALER_PATH = "models/scaler.pkl"
FEATURES_PATH = "models/feature_columns.pkl"
DATA_PATH = "machine_data_1000.csv"
HORIZON = 5
TEST_SIZE = 0.2
OUTPUT_DIR = "models"

def prepare_holdout(df_path, horizon=HORIZON, test_size=TEST_SIZE):
    df = load_data(df_path)
    df = basic_cleaning(df)
    df = create_rolling_features(df, window_sizes=[5,10,20], lag_features=[1,3,5], target_horizon=horizon)
    machines = df['machine_id'].unique()
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=42)
    train_idx, test_idx = next(gss.split(machines, groups=machines))
    test_machines = machines[test_idx]
    test_df = df[df['machine_id'].isin(test_machines)].reset_index(drop=True)
    return test_df


def per_machine_metrics(df_test, probs, preds, target_col='failure_within_horizon'):
    rows = []
    for m in df_test['machine_id'].unique():
        mask = df_test['machine_id'] == m
        y_true = df_test.loc[mask, target_col].to_numpy(dtype=int)
        y_prob = probs[mask.values]
        y_pred = preds[mask.values]
        # compute metrics only if both classes present for ROC
        try:
            roc = roc_auc_score(y_true, y_prob) if len(np.unique(y_true)) > 1 else np.nan
        except Exception:
            roc = np.nan
        try:
            ap = average_precision_score(y_true, y_prob) if len(np.unique(y_true)) > 1 else np.nan
        except Exception:
            ap = np.nan
        cm = confusion_matrix(y_true, y_pred)
        rows.append({
            'machine_id': m,
            'n_samples': int(mask.sum()),
            'positives': int(y_true.sum()),
            'roc_auc': float(roc) if not np.isnan(roc) else None,
            'avg_precision': float(ap) if not np.isnan(ap) else None,
            'tn': int(cm[0,0]) if cm.shape==(2,2) else None,
            'fp': int(cm[0,1]) if cm.shape==(2,2) else None,
            'fn': int(cm[1,0]) if cm.shape==(2,2) else None,
            'tp': int(cm[1,1]) if cm.shape==(2,2) else None,
        })
    return pd.DataFrame(rows)


def main():
    print("Preparing holdout set and loading artifacts...")
    df_test = prepare_holdout(DATA_PATH, horizon=HORIZON, test_size=TEST_SIZE)
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_cols = joblib.load(FEATURES_PATH)

    X_test = df_test[feature_cols].fillna(0)
    y_test = df_test['failure_within_horizon'].to_numpy(dtype=int)
    X_test_scaled = scaler.transform(X_test)
    probs = model.predict_proba(X_test_scaled)[:,1]
    preds = (probs >= 0.5).astype(int)

    # overall metrics
    roc = float(roc_auc_score(y_test, probs))
    ap = float(average_precision_score(y_test, probs))
    print(f"Holdout ROC AUC: {roc:.4f}")
    print(f"Holdout Average Precision: {ap:.4f}")

    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, probs)
    roc_auc_val = auc(fpr, tpr)
    plt.figure(figsize=(6,6))
    plt.plot(fpr, tpr, label=f'ROC (AUC = {roc_auc_val:.3f})')
    plt.plot([0,1],[0,1],'k--', alpha=0.3)
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve')
    plt.legend(loc='lower right')
    plt.grid(True)
    plt.tight_layout()
    roc_path = f"{OUTPUT_DIR}/roc_curve.png"
    plt.savefig(roc_path)
    print(f"Saved ROC curve to {roc_path}")

    # PR curve
    precision, recall, _ = precision_recall_curve(y_test, probs)
    pr_auc_val = auc(recall, precision)
    plt.figure(figsize=(6,6))
    plt.plot(recall, precision, label=f'PR (AUC = {pr_auc_val:.3f})')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend(loc='lower left')
    plt.grid(True)
    plt.tight_layout()
    pr_path = f"{OUTPUT_DIR}/pr_curve.png"
    plt.savefig(pr_path)
    print(f"Saved PR curve to {pr_path}")

    # classification report & confusion matrix
    creport = classification_report(y_test, preds, digits=4)
    print("Classification report:\n", creport)
    with open(f"{OUTPUT_DIR}/classification_report.txt","w") as f:
        f.write(str(creport))

    cm = confusion_matrix(y_test, preds)
    print("Confusion matrix:\n", cm)

    # per-machine breakdown
    per_machine = per_machine_metrics(df_test, probs, preds)
    per_machine_path = f"{OUTPUT_DIR}/per_machine_metrics.csv"
    per_machine.to_csv(per_machine_path, index=False)
    print(f"Saved per-machine metrics to {per_machine_path}")

    # save top machines by AUC and by AP for inspection
    top_auc = per_machine.dropna(subset=['roc_auc']).sort_values('roc_auc', ascending=False).head(5)
    top_ap = per_machine.dropna(subset=['avg_precision']).sort_values('avg_precision', ascending=False).head(5)
    print("Top machines by ROC AUC:")
    print(top_auc[['machine_id','n_samples','positives','roc_auc']].to_string(index=False))
    print("Top machines by Avg Precision:")
    print(top_ap[['machine_id','n_samples','positives','avg_precision']].to_string(index=False))

if __name__ == '__main__':
    main()
