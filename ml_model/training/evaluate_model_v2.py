import pandas as pd
import numpy as np
import time
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

def evaluate_classifier(model_name, model, X_test, y_test, predict_time_start):
    y_pred = model.predict(X_test)
    predict_time = time.time() - predict_time_start
    
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
        roc_auc = roc_auc_score(y_test, y_prob)
    else:
        roc_auc = np.nan
        
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    
    report_text = f"\n--- {model_name} ---\n"
    report_text += classification_report(y_test, y_pred, zero_division=0)
    report_text += f"\nConfusion Matrix:\n{cm}\n"
    
    return {
        'Model': model_name,
        'Accuracy': acc,
        'Precision': prec,
        'Recall': rec,
        'F1 Score': f1,
        'ROC-AUC': roc_auc,
        'Prediction Time (s)': predict_time
    }, report_text

def format_comparison_table(results_df):
    display_df = results_df.copy()
    for col in display_df.select_dtypes(include=['float64']).columns:
        display_df[col] = display_df[col].apply(lambda x: f"{x:.4f}")
    return display_df
