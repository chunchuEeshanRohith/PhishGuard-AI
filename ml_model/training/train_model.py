import os
import time
import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB

from evaluate_model import evaluate_classifier, format_comparison_table

def get_models():
    """Initializes and returns the dictionary of models."""
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Support Vector Machine': SVC(probability=True, random_state=42),
        'Naive Bayes': GaussianNB()
    }
    
    # Try adding XGBoost if available and compiled correctly on this OS
    try:
        import xgboost as xgb
        # Create a dummy instance to see if the library loaded correctly (handles Mac libomp missing issue)
        xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
        models['XGBoost'] = xgb_model
    except Exception as e:
        print(f"⚠️ Skipping XGBoost: Library not available or failed to load ({type(e).__name__})")
        
    return models

def main():
    print("🚀 Starting Machine Learning Pipeline...")
    
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_dir = os.path.join(base_dir, 'dataset')
    models_dir = os.path.join(base_dir, 'models')
    
    # Output file paths
    model_path = os.path.join(models_dir, 'phishing_model.pkl')
    report_path = os.path.join(base_dir, 'classification_report.txt')
    comparison_path = os.path.join(base_dir, 'model_comparison.csv')
    
    os.makedirs(models_dir, exist_ok=True)
    
    # 1. Load the exact same train/test splits
    print("Loading data splits...")
    X_train = pd.read_csv(os.path.join(dataset_dir, 'X_train.csv'))
    X_test = pd.read_csv(os.path.join(dataset_dir, 'X_test.csv'))
    y_train = pd.read_csv(os.path.join(dataset_dir, 'y_train.csv'))['Result']
    y_test = pd.read_csv(os.path.join(dataset_dir, 'y_test.csv'))['Result']
    
    models = get_models()
    results = []
    trained_models = {}
    full_report = "--- PHISHING DETECTION CLASSIFICATION REPORT ---\n"
    
    # 2. Train and evaluate each model
    for name, model in models.items():
        print(f"--> Training {name}...")
        
        # Track training time
        train_start = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - train_start
        trained_models[name] = model
        
        # Track prediction time and evaluate
        predict_start = time.time()
        metrics, report_text = evaluate_classifier(name, model, X_test, y_test, predict_start)
        
        metrics['Training Time (s)'] = train_time
        results.append(metrics)
        full_report += report_text
        
    # 3. Create Comparison DataFrame & Rank Models
    results_df = pd.DataFrame(results)
    
    # Rank models primarily by F1 Score (descending) as phishing is highly sensitive to false negatives
    results_df = results_df.sort_values(by='F1 Score', ascending=False).reset_index(drop=True)
    
    # 4. Save artifacts
    print(f"\nSaving classification report to {report_path}")
    with open(report_path, 'w') as f:
        f.write(full_report)
        
    print(f"Saving comparison table to {comparison_path}")
    results_df.to_csv(comparison_path, index=False)
    
    # 5. Display professional table
    print("\n" + "="*90)
    print("🏆 MODEL COMPARISON TABLE (Ranked by F1 Score)")
    print("="*90)
    print(format_comparison_table(results_df).to_string(index=False))
    print("="*90)
    
    # 6. Select and Save the Best Model
    best_row = results_df.iloc[0]
    best_model_name = best_row['Model']
    best_model = trained_models[best_model_name]
    
    print(f"\n🥇 BEST ALGORITHM SELECTED: {best_model_name}")
    print(f"Reason: {best_model_name} achieved the highest F1 Score ({best_row['F1 Score']:.4f}) and Accuracy ({best_row['Accuracy']:.4f}).")
    print("In phishing detection, the F1 score provides the best balance between precision (not blocking valid sites) and recall (catching malicious sites).")
    
    print(f"\n💾 Saving {best_model_name} to {model_path}...")
    joblib.dump(best_model, model_path)
    
    # Print Final Summary Requested
    print("\n" + "="*50)
    print("🏁 FINAL SUMMARY")
    print("="*50)
    print(f"Best Algorithm    : {best_model_name}")
    print(f"Accuracy          : {best_row['Accuracy']:.4f}")
    print(f"Precision         : {best_row['Precision']:.4f}")
    print(f"Recall            : {best_row['Recall']:.4f}")
    print(f"F1 Score          : {best_row['F1 Score']:.4f}")
    print(f"Training Time     : {best_row['Training Time (s)']:.4f} seconds")
    print(f"Prediction Time   : {best_row['Prediction Time (s)']:.4f} seconds")
    print("="*50)

if __name__ == "__main__":
    main()
