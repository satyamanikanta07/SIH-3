"""
Synthetic Dataset Generator for North Eastern Region (NER) Road Disruption Prediction
Generates realistic multi-factor road accessibility and disruption datasets reflecting
monsoon rainfall, mountainous slopes, fragile soil, and landslide-prone topography.
"""

import numpy as np
import pandas as pd
import os

def generate_ner_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)

    # 1. Rainfall in mm (Monsoon season in NER can exceed 300mm in 24-48h)
    rainfall_mm = np.random.exponential(scale=65.0, size=n_samples)
    rainfall_mm = np.clip(rainfall_mm, 0, 350)

    # 2. Temperature in Celsius (Hill stations 12-24C, plains up to 36C)
    temperature_c = np.random.normal(loc=23.0, scale=6.0, size=n_samples)
    temperature_c = np.clip(temperature_c, 8, 38)

    # 3. Road condition (0: Good, 1: Fair, 2: Poor, 3: Very Poor)
    road_condition = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.35, 0.35, 0.20, 0.10])

    # 4. Traffic level (0: Low, 1: Moderate, 2: Heavy, 3: Standstill)
    traffic_level = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.40, 0.35, 0.18, 0.07])

    # 5. Terrain slope risk (0 to 100, steep Himalayan and Patkai hills have high slope risk)
    slope_risk = np.random.beta(a=2.5, b=2.0, size=n_samples) * 100.0

    # 6. Historical incident count on the route
    historical_incidents = np.random.poisson(lam=4.5, size=n_samples)
    historical_incidents = np.clip(historical_incidents, 0, 25)

    # 7. Previous landslides count in district/sector
    previous_landslides = np.random.poisson(lam=2.5, size=n_samples)
    previous_landslides = np.clip(previous_landslides, 0, 15)

    # 8. Flood risk level (0: Low, 1: Medium, 2: High, 3: Critical)
    flood_risk = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.50, 0.25, 0.18, 0.07])

    # 9. Bridge condition (0: Good, 1: Fair, 2: Poor, 3: Critical)
    bridge_condition = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.55, 0.25, 0.15, 0.05])

    # Calculate domain-driven disruption score
    # Heavy rainfall + steep slope + previous landslides = extreme landslide danger in NER
    disruption_score = (
        (rainfall_mm / 350.0) * 35.0 +
        (slope_risk / 100.0) * 20.0 +
        (previous_landslides / 15.0) * 15.0 +
        (road_condition / 3.0) * 12.0 +
        (flood_risk / 3.0) * 10.0 +
        (historical_incidents / 25.0) * 8.0 +
        (bridge_condition / 3.0) * 8.0 +
        (traffic_level / 3.0) * 7.0 +
        np.random.normal(0, 4.0, size=n_samples) # Noise
    )

    # Scale score from 0 to 100
    disruption_probability = np.clip(disruption_score, 0, 100)

    # Binary label: Disrupted if probability >= 55%
    disrupted = (disruption_probability >= 55.0).astype(int)

    df = pd.DataFrame({
        'rainfall_mm': np.round(rainfall_mm, 1),
        'temperature_c': np.round(temperature_c, 1),
        'road_condition': road_condition,
        'traffic_level': traffic_level,
        'slope_risk': np.round(slope_risk, 1),
        'historical_incidents': historical_incidents,
        'previous_landslides': previous_landslides,
        'flood_risk': flood_risk,
        'bridge_condition': bridge_condition,
        'disruption_probability': np.round(disruption_probability, 1),
        'is_disrupted': disrupted
    })

    return df

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(data_dir, 'ner_road_disruption_dataset.csv')
    df = generate_ner_dataset(n_samples=6000)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} samples saved to {output_path}")
    print("Class distribution:")
    print(df['is_disrupted'].value_counts(normalize=True))
