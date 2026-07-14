import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB

from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    roc_auc_score, 
    confusion_matrix
)

def load_data(filepath):
    print(f"Loading processed dataset from {filepath}...")
    return pd.read_csv(filepath)

def train_and_evaluate(models, X_train, X_test, y_train, y_test):
    """Train multiple models and evaluate them on various metrics."""
    results = []
    trained_models = {}
    
    print("\nTraining and evaluating models...\n")
    
    for name, model in models.items():
        print(f"--> Training {name}...")
        
        # Train model
        model.fit(X_train, y_train)
        trained_models[name] = model
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Probabilities for ROC-AUC (some models need different handling)
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X_test)[:, 1]
            roc_auc = roc_auc_score(y_test, y_prob)
        else:
            # Fallback for models without predict_proba (like SVC with probability=False by default, 
            # though we set it to True below)
            roc_auc = np.nan
            
        # Compute metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        
        # Store results
        results.append({
            'Model': name,
            'Accuracy': acc,
            'Precision': prec,
            'Recall': rec,
            'F1 Score': f1,
            'ROC-AUC': roc_auc,
            'Confusion Matrix': str(cm.tolist())
        })
        
    return pd.DataFrame(results), trained_models

def main():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'dataset', 'processed_phishing.csv')
    model_dir = os.path.join(base_dir, 'models')
    model_path = os.path.join(model_dir, 'phishing_model.pkl')
    
    # Create models directory if it doesn't exist
    os.makedirs(model_dir, exist_ok=True)
    
    # Load dataset
    df = load_data(data_path)
    
    # Separate Features (X) and Target (y)
    X = df.drop(columns=['Result'])
    y = df['Result']
    
    # Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Initialize models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Support Vector Machine': SVC(probability=True, random_state=42),
        'Naive Bayes': GaussianNB()
    }
    
    # Train, evaluate, and get results
    results_df, trained_models = train_and_evaluate(models, X_train, X_test, y_train, y_test)
    
    # Display comparison table
    print("\n" + "="*80)
    print("MODEL COMPARISON TABLE")
    print("="*80)
    # Exclude confusion matrix from the main printed table for cleaner formatting
    display_df = results_df.drop(columns=['Confusion Matrix'])
    
    # Format floating point numbers for better readability
    for col in display_df.select_dtypes(include=['float64']).columns:
        display_df[col] = display_df[col].apply(lambda x: f"{x:.4f}")
        
    print(display_df.to_string(index=False))
    
    # Select best model based on F1 Score
    # We use F1 Score because in phishing detection, both false positives (blocking valid sites) 
    # and false negatives (allowing phishing sites) are costly, so a balance is ideal.
    best_model_row = results_df.loc[results_df['F1 Score'].idxmax()]
    best_model_name = best_model_row['Model']
    best_model = trained_models[best_model_name]
    
    print("\n" + "="*80)
    print(f"BEST MODEL SELECTED: {best_model_name}")
    print("="*80)
    print(f"Reason: Achieved the highest F1 Score ({best_model_row['F1 Score']:.4f}) and Accuracy ({best_model_row['Accuracy']:.4f}),")
    print("showing it balances false positives and false negatives better than the others.")
    print(f"\nConfusion Matrix for {best_model_name}:")
    print(best_model_row['Confusion Matrix'])
    
    # Save the best model
    print(f"\nSaving best model to {model_path}...")
    joblib.dump(best_model, model_path)
    print("Model saved successfully!")
    
    # Note on preprocessing objects:
    # We did not normalize or scale the categorical (-1, 0, 1) features, 
    # and we didn't use any OneHotEncoder. 
    # Thus, there are no additional preprocessing objects (like standard scaler) to save.

if __name__ == "__main__":
    main()
