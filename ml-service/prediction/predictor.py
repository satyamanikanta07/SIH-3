"""
Predictor service for NER Smart Logistics Platform.
Loads trained ML models, handles feature transformations, executes predictions,
and generates human-interpretable contributing factors and alternate routes.
"""

import os
import joblib
import numpy as np

# Map categorical text values to numeric representations
ROAD_CONDITION_MAP = {'Good': 0, 'Fair': 1, 'Poor': 2, 'Very Poor': 3}
TRAFFIC_LEVEL_MAP = {'Low': 0, 'Moderate': 1, 'Heavy': 2, 'Standstill': 3}
FLOOD_RISK_MAP = {'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3}
BRIDGE_CONDITION_MAP = {'Good': 0, 'Fair': 1, 'Poor': 2, 'Critical': 3, 'N/A': 0}

class DisruptionPredictor:
    def __init__(self, model_path: str = None):
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, 'models', 'disruption_model.joblib')
        
        self.model = None
        self.metadata = None
        self.model_path = model_path
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                meta_path = os.path.join(os.path.dirname(self.model_path), 'model_metadata.joblib')
                if os.path.exists(meta_path):
                    self.metadata = joblib.load(meta_path)
                print(f"✅ Loaded ML model from {self.model_path}")
            except Exception as e:
                print(f"⚠️ Error loading model from {self.model_path}: {e}")
                self.model = None
        else:
            print(f"ℹ️ Model file not found at {self.model_path}. Will use trained fallback logic.")

    def predict_disruption(self, input_data: dict) -> dict:
        rainfall = float(input_data.get('rainfall', input_data.get('rainfall_mm', 45.0)))
        temperature = float(input_data.get('temperature', input_data.get('temperature_c', 24.0)))

        # Normalize categorical features
        rc = input_data.get('road_condition', 'Fair')
        rc_num = ROAD_CONDITION_MAP.get(rc, rc if isinstance(rc, (int, float)) else 1)

        tl = input_data.get('traffic_level', 'Moderate')
        tl_num = TRAFFIC_LEVEL_MAP.get(tl, tl if isinstance(tl, (int, float)) else 1)

        slope_risk = float(input_data.get('slope_risk', input_data.get('terrain_slope_risk', 40.0)))
        hist_incidents = float(input_data.get('historical_incidents', 2))
        prev_landslides = float(input_data.get('previous_landslides', 1))

        fr = input_data.get('flood_risk', 'Low')
        fr_num = FLOOD_RISK_MAP.get(fr, fr if isinstance(fr, (int, float)) else 0)

        bc = input_data.get('bridge_condition', 'Good')
        bc_num = BRIDGE_CONDITION_MAP.get(bc, bc if isinstance(bc, (int, float)) else 0)

        import pandas as pd
        feature_cols = [
            'rainfall_mm', 'temperature_c', 'road_condition', 'traffic_level',
            'slope_risk', 'historical_incidents', 'previous_landslides',
            'flood_risk', 'bridge_condition'
        ]
        features_df = pd.DataFrame([[
            rainfall, temperature, rc_num, tl_num, slope_risk,
            hist_incidents, prev_landslides, fr_num, bc_num
        ]], columns=feature_cols)

        if self.model is not None:
            proba = float(self.model.predict_proba(features_df)[0, 1]) * 100.0
            is_model_inference = True
        else:
            # Domain-driven baseline score
            score = (
                (rainfall / 300.0) * 35.0 +
                (slope_risk / 100.0) * 20.0 +
                (prev_landslides / 10.0) * 15.0 +
                (rc_num / 3.0) * 12.0 +
                (fr_num / 3.0) * 10.0 +
                (hist_incidents / 20.0) * 8.0 +
                (bc_num / 3.0) * 8.0 +
                (tl_num / 3.0) * 7.0
            )
            proba = float(np.clip(score, 5.0, 98.0))
            is_model_inference = False

        proba = round(proba, 1)

        if proba >= 75.0:
            risk_level = 'Critical'
        elif proba >= 50.0:
            risk_level = 'High'
        elif proba >= 25.0:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'

        # Determine contributing factors based on thresholds
        factors = []
        if rainfall >= 100.0:
            factors.append(f"Severe precipitation ({rainfall} mm) exceeding soil absorption limit")
        elif rainfall >= 50.0:
            factors.append(f"Moderate rainfall ({rainfall} mm) raising moisture saturation")

        if rc_num >= 2:
            factors.append(f"Degraded road surface condition ('{rc}')")

        if slope_risk >= 60.0:
            factors.append(f"Steep geological slope gradient ({slope_risk:.1f}% risk factor)")

        if prev_landslides >= 2:
            factors.append(f"High historical landslide frequency ({int(prev_landslides)} past events)")

        if fr_num >= 2:
            factors.append("Substantial riverine flood or waterlogging vulnerability")

        if bc_num >= 2:
            factors.append(f"Compromised bridge structural stability ('{bc}')")

        if tl_num >= 2:
            factors.append(f"Heavy vehicular congestion impeding quick evacuation ('{tl}')")

        if not factors:
            factors.append("Favorable atmospheric and geological conditions")

        return {
            'disruption_probability': proba,
            'risk_level': risk_level,
            'contributing_factors': factors,
            'is_ml_model': is_model_inference,
            'model_type': 'RandomForestClassifier' if is_model_inference else 'RuleBasedFallback'
        }

    def recommend_routes(self, origin: str, destination: str, blocked_roads: list = None) -> list:
        blocked_roads = [r.upper() for r in (blocked_roads or [])]
        
        # NER Strategic Route Network
        routes = [
            {
                'id': 'R-OPT-1',
                'name': f"Primary Corridor ({origin} → {destination})",
                'via': 'National Highway (NH-27 / NH-37)',
                'distance': '245 km',
                'estimatedTime': '6h 30m',
                'risk': 'Low' if not any('NH-27' in b or 'NH-37' in b for b in blocked_roads) else 'Critical',
                'status': 'Recommended' if not any('NH-27' in b or 'NH-37' in b for b in blocked_roads) else 'Blocked',
                'delay': '+0m',
                'safety_score': 92,
                'description': f"Direct highway via {origin} bypass to {destination}."
            },
            {
                'id': 'R-ALT-2',
                'name': f"Alternate Valley Route ({origin} → Bypass → {destination})",
                'via': 'State Highway (SH-01 / SH-05)',
                'distance': '278 km',
                'estimatedTime': '7h 45m',
                'risk': 'Medium',
                'status': 'Alternative' if any('NH-27' in b or 'NH-37' in b for b in blocked_roads) else 'Standby',
                'delay': '+1h 15m',
                'safety_score': 78,
                'description': "All-weather asphalt route traversing mid-altitude terrain with lower landslide frequency."
            },
            {
                'id': 'R-SAF-3',
                'name': f"Emergency High-Elevation Route",
                'via': 'District Bypass Corridors (DR-02 / RR-08)',
                'distance': '315 km',
                'estimatedTime': '9h 10m',
                'risk': 'Low',
                'status': 'Safest',
                'delay': '+2h 40m',
                'safety_score': 95,
                'description': "Avoids river basin flash-flood zones and active debris fields. Recommended for critical medical cargo."
            }
        ]
        return routes

    def predict_eta(self, distance_km: float, traffic_level: str = 'Moderate', weather_condition: str = 'Clear', road_condition: str = 'Fair') -> dict:
        base_speed = 45.0  # km/h on hill highways

        if traffic_level == 'Heavy':
            base_speed -= 15.0
        elif traffic_level == 'Standstill':
            base_speed -= 28.0
        elif traffic_level == 'Low':
            base_speed += 5.0

        if weather_condition in ['Heavy Rain', 'Storm']:
            base_speed -= 12.0
        elif weather_condition in ['Light Rain', 'Fog']:
            base_speed -= 6.0

        if road_condition in ['Poor', 'Very Poor']:
            base_speed -= 10.0

        avg_speed = max(base_speed, 12.0)
        hours = float(distance_km) / avg_speed
        h = int(hours)
        m = int((hours - h) * 60)

        return {
            'distance_km': distance_km,
            'avg_speed_kmh': round(avg_speed, 1),
            'eta': f"{h}h {m}m",
            'total_minutes': int(hours * 60)
        }
