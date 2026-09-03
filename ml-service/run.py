"""
Runner script for NER ML Service
Ensures model artifact is trained/cached, then starts FastAPI server on port 8000.
"""

import os
import sys

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'models', 'disruption_model.joblib')

    if not os.path.exists(model_path):
        print("⚡ No cached model found. Starting training workflow...")
        from training.train import train_model
        train_model()
    else:
        print("✅ Found existing disruption_model.joblib artifact.")

    import uvicorn
    print("\n🚀 Starting NER ML FastAPI server on http://localhost:8000 ...")
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == '__main__':
    main()
