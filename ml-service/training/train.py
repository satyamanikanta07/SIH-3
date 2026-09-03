"""
Training Script for NER Road Disruption Prediction Model
Trains Random Forest & Gradient Boosting models on multi-feature NER logistics data,
evaluates performance metrics, and exports artifacts using joblib.
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, classification_report

# Ensure local data generator is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from data.generate_dataset import generate_ner_dataset

def train_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, '..', 'data', 'ner_road_disruption_dataset.csv')
    models_dir = os.path.join(current_dir, '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    if os.path.exists(data_path):
        print(f"Loading existing dataset from {data_path}...")
        df = pd.read_csv(data_path)
    else:
        print("Generating new dataset...")
        df = generate_ner_dataset(n_samples=6000)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)

    feature_cols = [
        'rainfall_mm',
        'temperature_c',
        'road_condition',
        'traffic_level',
        'slope_risk',
        'historical_incidents',
        'previous_landslides',
        'flood_risk',
        'bridge_condition'
    ]

    X = df[feature_cols]
    y = df['is_disrupted']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")

    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train, y_train)

    # Evaluate
    y_pred = rf_model.predict(X_test)
    y_proba = rf_model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_proba)

    print(f"✅ Random Forest Model Evaluation:")
    print(f"   Accuracy:  {acc:.4f}")
    print(f"   Precision: {prec:.4f}")
    print(f"   Recall:    {rec:.4f}")
    print(f"   ROC-AUC:   {roc:.4f}")

    # Feature Importance
    importances = dict(zip(feature_cols, rf_model.feature_importances_))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\nFeature Importances:")
    for feat, imp in sorted_importances:
        print(f"   {feat:<22}: {imp:.4f}")

    # Save model and metadata
    model_export_path = os.path.join(models_dir, 'disruption_model.joblib')
    meta_export_path = os.path.join(models_dir, 'model_metadata.joblib')

    metadata = {
        'feature_names': feature_cols,
        'metrics': {'accuracy': acc, 'precision': prec, 'recall': rec, 'roc_auc': roc},
        'feature_importances': importances,
        'model_type': 'RandomForestClassifier'
    }

    joblib.dump(rf_model, model_export_path)
    joblib.dump(metadata, meta_export_path)
    print(f"\nSaved model artifact to: {model_export_path}")
    print(f"Saved metadata to: {meta_export_path}")

    return rf_model, metadata

if __name__ == '__main__':
    train_model()
