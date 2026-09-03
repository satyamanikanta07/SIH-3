"""
FastAPI Microservice for NER Smart Logistics Intelligence Platform
Provides REST endpoints for ML disruption predictions, intelligent alternate routing,
and dynamic transit ETA calculations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import sys
import os

# Include package paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from prediction.predictor import DisruptionPredictor

app = FastAPI(
    title="NER Smart Logistics ML Intelligence Service",
    description="Machine learning disruption prediction and alternate route intelligence for India's North Eastern Region",
    version="1.0.0"
)

# Enable CORS for frontend and backend Node.js calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = DisruptionPredictor()

# --- Request/Response Models ---

class DisruptionRequest(BaseModel):
    rainfall: Optional[float] = Field(default=45.0, description="Precipitation in mm")
    temperature: Optional[float] = Field(default=24.0, description="Ambient temperature in C")
    road_condition: Optional[str] = Field(default="Fair", description="Good, Fair, Poor, Very Poor")
    traffic_level: Optional[str] = Field(default="Moderate", description="Low, Moderate, Heavy, Standstill")
    slope_risk: Optional[float] = Field(default=40.0, description="Terrain slope hazard percentage 0-100")
    historical_incidents: Optional[int] = Field(default=2, description="Recorded past incidents on road")
    previous_landslides: Optional[int] = Field(default=1, description="Recorded historical landslides")
    flood_risk: Optional[str] = Field(default="Low", description="Low, Medium, High, Critical")
    bridge_condition: Optional[str] = Field(default="Good", description="Good, Fair, Poor, Critical")

class DisruptionResponse(BaseModel):
    disruption_probability: float
    risk_level: str
    contributing_factors: List[str]
    is_ml_model: bool
    model_type: str

class RouteRecommendationRequest(BaseModel):
    origin: str = Field(default="Guwahati", description="Departure district or city")
    destination: str = Field(default="Shillong", description="Target destination")
    blocked_roads: Optional[List[str]] = Field(default=[], description="List of currently blocked corridors")

class RouteItem(BaseModel):
    id: str
    name: str
    via: str
    distance: str
    estimatedTime: str
    risk: str
    status: str
    delay: str
    safety_score: int
    description: str

class RouteRecommendationResponse(BaseModel):
    origin: str
    destination: str
    routes: List[RouteItem]

class ETARequest(BaseModel):
    distance: float = Field(default=103.0, description="Distance in kilometers")
    traffic_level: Optional[str] = Field(default="Moderate")
    weather_condition: Optional[str] = Field(default="Clear")
    road_condition: Optional[str] = Field(default="Fair")

class ETAResponse(BaseModel):
    distance_km: float
    avg_speed_kmh: float
    eta: str
    total_minutes: int

# --- API Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NER Logistics ML Service",
        "has_trained_model": predictor.model is not None,
        "region": "North Eastern Region (NER), India"
    }

@app.post("/predict-disruption", response_model=DisruptionResponse)
def predict_disruption(payload: DisruptionRequest):
    try:
        result = predictor.predict_disruption(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-route", response_model=RouteRecommendationResponse)
def recommend_route(payload: RouteRecommendationRequest):
    try:
        routes = predictor.recommend_routes(
            origin=payload.origin,
            destination=payload.destination,
            blocked_roads=payload.blocked_roads
        )
        return {
            "origin": payload.origin,
            "destination": payload.destination,
            "routes": routes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-eta", response_model=ETAResponse)
def predict_eta(payload: ETARequest):
    try:
        result = predictor.predict_eta(
            distance_km=payload.distance,
            traffic_level=payload.traffic_level or "Moderate",
            weather_condition=payload.weather_condition or "Clear",
            road_condition=payload.road_condition or "Fair"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
