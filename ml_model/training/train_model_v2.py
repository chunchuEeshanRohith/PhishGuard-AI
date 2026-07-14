import os
import time
import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB

from evaluate_model_v2 import evaluate_classifier, format_comparison_table

def get_models():
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Support Vector Machine': SVC(probability=True, random_state=42),
        'Naive Bayes': GaussianNB()
    }
    try:
        import xgboost as xgb
        xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
        models['XGBoost'] = xgb_model
    except Exception:
        pass
    return models

def main():
    print("🚀 Starting Reduced Feature Machine Learning Pipeline (v2)...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_dir = os.path.join(base_dir, 'dataset')
    models_dir = os.path.join(base_dir, 'models')
    
    model_path = os.path.join(models_dir, 'phishing_model.pkl')
    
    X_train = pd.read_csv(os.path.join(dataset_dir, 'X_train_v2.csv'))
    X_test = pd.read_csv(os.path.join(dataset_dir, 'X_test_v2.csv'))
    y_train = pd.read_csv(os.path.join(dataset_dir, 'y_train_v2.csv'))['Result']
    y_test = pd.read_csv(os.path.join(dataset_dir, 'y_test_v2.csv'))['Result']
    
    models = get_models()
    results = []
    trained_models = {}
    
    for name, model in models.items():
        print(f"--> Training {name} on {X_train.shape[1]} features...")
        
        train_start = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - train_start
        trained_models[name] = model
        
        predict_start = time.time()
        metrics, _ = evaluate_classifier(name, model, X_test, y_test, predict_start)
        metrics['Training Time (s)'] = train_time
        results.append(metrics)
        
    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values(by='F1 Score', ascending=False).reset_index(drop=True)
    
    print("\n" + "="*90)
    print("🏆 MODEL COMPARISON TABLE (Ranked by F1 Score - 12 Feature Model)")
    print("="*90)
    print(format_comparison_table(results_df).to_string(index=False))
    print("="*90)
    
    best_row = results_df.iloc[0]
    best_model_name = best_row['Model']
    best_model = trained_models[best_model_name]
    
    print(f"\n🥇 BEST ALGORITHM SELECTED: {best_model_name}")
    print(f"💾 Saving {best_model_name} to {model_path}...")
    joblib.dump(best_model, model_path)

if __name__ == "__main__":
    main()
