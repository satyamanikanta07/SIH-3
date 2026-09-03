# 🚛 NER Smart Logistics & Accessibility Intelligence Platform

An integrated, AI-powered logistics, road accessibility, and disaster management platform tailored specifically for the **North Eastern Region (NER) of India** (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Sikkim, Tripura, Arunachal Pradesh).

---

## 🌟 Key Highlights & Capabilities

1. **Road Accessibility Monitoring**: Real-time status tracking for National Highways (NH-27, NH-37, NH-06, NH-02, NH-10, NH-39), State Highways, bridges, and district corridors with disruption probability indicators.
2. **AI-Based Disruption Prediction**: Python machine learning service (Random Forest Classifier, 97.1% accuracy, 0.98 ROC-AUC) calculating disruption likelihood based on precipitation, terrain slope hazard, historical landslides, road quality, and traffic.
3. **Alternate Route Recommendation**: Intelligent bypass calculation and routing engine when primary corridors are blocked or at critical risk.
4. **GPS Vehicle Telemetry Tracking**: Live tracking of critical supply vehicles carrying medicines, emergency food supplies, oxygen/fuel, and agricultural cargo.
5. **Incident & Disaster Management**: Geo-tagged reporting and tracking for landslides, flash floods, road subsidence, and bridge structural issues.
6. **Offline-Friendly Field Reporting**: Mobile-ready field inspection reporting with automatic GPS geolocation, local storage queuing, and batch synchronization when connectivity resumes.
7. **Weather Hazard Integration**: Monitoring precipitation, wind, visibility, and flood alert levels across NER districts.
8. **Multi-Agency Alerts**: Priority-based notification system for emergency responses.
9. **Analytics & Connectivity Dashboards**: Visual charts (Recharts) covering corridor accessibility, incident distributions, cargo delays, and district accessibility scores.
10. **Interactive 11-Step Emergency Simulation**: Built-in demonstration scenario verifying end-to-end incident detection, AI prediction, road status flipping to BLOCKED, vehicle rerouting, ETA recalculation, and district score updates.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React.js Frontend                    │
│   (Vite + React Router + Leaflet.js GIS + Recharts)    │
└───────────────────────────┬─────────────────────────────┘
                            │ REST APIs / JSON
┌───────────────────────────▼─────────────────────────────┐
│                 Node.js / Express Backend               │
│     (REST APIs, JWT Auth, Mongoose Models, Validation)  │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             │
┌─────────────▼──────────────┐ ┌────────────▼─────────────┐
│      MongoDB Database      │ │     Python ML Service     │
│ (9 Mongoose Data Models +  │ │ (FastAPI, Scikit-Learn,   │
│   Realistic NER Seed Data) │ │  Random Forest, Joblib)  │
└────────────────────────────┘ └──────────────────────────┘
```

---

## 📁 Project Directory Structure

```
prototypeCLI/
├── backend/
│   ├── middleware/
│   │   └── auth.js             # JWT authentication & role-based authorization
│   ├── models/                 # 9 Mongoose data schemas
│   │   ├── Alert.js
│   │   ├── Delivery.js
│   │   ├── District.js
│   │   ├── FieldReport.js
│   │   ├── Incident.js
│   │   ├── Road.js
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   └── WeatherData.js
│   ├── routes/                 # 11 REST API route controllers
│   │   ├── alerts.js
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── deliveries.js
│   │   ├── districts.js
│   │   ├── fieldReports.js
│   │   ├── incidents.js
│   │   ├── predict.js          # Proxy to ML Service with rule-based fallback
│   │   ├── roads.js
│   │   ├── vehicles.js
│   │   └── weather.js
│   ├── seed/
│   │   └── seedData.js         # Comprehensive realistic NER dataset seeder
│   ├── test_load.js            # Module integrity verification test
│   ├── server.js               # Express server entry point
│   ├── .env                    # Configuration & port settings
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardMap.jsx # Interactive Leaflet GIS regional map
│   │   │   └── Layout.jsx       # Responsive sidebar & navigation header
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Real-time NER logistics operations overview
│   │   │   ├── LiveMap.jsx      # Full GIS interactive map with layer toggles
│   │   │   ├── Vehicles.jsx     # Fleet management & GPS tracking
│   │   │   ├── RoutesPage.jsx   # Route analysis & alternate route finder
│   │   │   ├── Incidents.jsx    # Disaster & hazard tracking
│   │   │   ├── Alerts.jsx       # Alert notification center
│   │   │   ├── Logistics.jsx    # Essential supplies delivery tracking
│   │   │   ├── Analytics.jsx    # Recharts metrics & accessibility trends
│   │   │   ├── FieldReports.jsx # Mobile offline-enabled reporting form
│   │   │   ├── Simulation.jsx   # 11-step interactive emergency scenario
│   │   │   ├── Settings.jsx     # User settings & district drill-down view
│   │   │   └── Login.jsx        # Authentication with demo quick-login
│   │   ├── services/
│   │   │   └── api.js           # Axios API client with interceptors
│   │   ├── App.jsx              # Main routing & authentication state
│   │   ├── index.css            # Complete design system & responsive styling
│   │   └── main.jsx             # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── ml-service/
│   ├── api/
│   │   └── main.py              # FastAPI application (/predict-disruption, etc.)
│   ├── data/
│   │   ├── generate_dataset.py  # Synthetic NER multi-factor data generator
│   │   └── ner_road_disruption_dataset.csv
│   ├── models/
│   │   ├── disruption_model.joblib  # Trained Random Forest artifact
│   │   └── model_metadata.joblib   # Feature metadata & metrics
│   ├── prediction/
│   │   └── predictor.py         # Prediction engine, ETA, and route selector
│   ├── training/
│   │   └── train.py             # Model training & validation pipeline
│   ├── requirements.txt
│   └── run.py                   # Service bootstrapper
│
├── PROJECT_STATUS.md            # Comprehensive completion & handover report
└── README.md
```

---

## ⚡ One-Click Batch Scripts (Windows)

Simply double-click:
* [**`run.bat`**](file:///c:/Users/ADMIN/OneDrive/Desktop/prototypeCLI/run.bat) — Automatically boots all 3 microservices (Python ML Service, Node.js Backend API, React Frontend) in separate terminal windows and launches your default web browser at `http://localhost:5173`.
* [**`test_rbac.bat`**](file:///c:/Users/ADMIN/OneDrive/Desktop/prototypeCLI/test_rbac.bat) — Executes the automated 36-point Role-Based Access Control (RBAC) & permissions test suite across all 4 roles.
* [**`seed.bat`**](file:///c:/Users/ADMIN/OneDrive/Desktop/prototypeCLI/seed.bat) — Seeds MongoDB with the realistic NER dataset (Districts, Roads, Routes, Vehicles, Incidents, Deliveries, Alerts, Weather).
* [**`stop_all.bat`**](file:///c:/Users/ADMIN/OneDrive/Desktop/prototypeCLI/stop_all.bat) — Cleanly terminates all services running on ports 8000, 5000, and 5173.

---

## 🚀 Manual Getting Started

### Prerequisites
- **Node.js** (v18 or newer)
- **Python** (v3.10 to v3.13)
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas)

---

### 1. Start the Python Machine Learning Service

```bash
cd ml-service
pip install -r requirements.txt
python run.py
```
*The ML service will automatically verify the trained model and start on `http://localhost:8000`.*
*Interactive Swagger docs available at `http://localhost:8000/docs`.*

---

### 2. Start the Backend API & Seed Database

```bash
cd backend
npm install
npm run seed     # Populates MongoDB with realistic NER districts, roads, vehicles, etc.
npm start        # Starts Express on http://localhost:5000
```

> **Demo Fallback**: Even if MongoDB is offline, the React frontend contains built-in demo datasets and backend fallbacks, allowing zero-friction demonstrations immediately.

---

### 3. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```
*Opens on `http://localhost:5173`.*

---

## 🔑 Login Credentials

The platform provides role-based authentication. Use any of the credentials below:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@nerlogistics.gov.in` | `admin123` | Full administrative oversight |
| **Government Official** | `official@nerlogistics.gov.in` | `official123` | Analytics, district dashboards, alerts |
| **Field Officer** | `field@nerlogistics.gov.in` | `field123` | Field reports, photo uploads, road inspections |
| **Driver** | `driver@nerlogistics.gov.in` | `driver123` | Vehicle routes, GPS status, alternate diversions |

*Quick-login buttons on the login page allow single-click access without typing credentials.*

---

## 🧪 Demonstration Scenario (11-Step Disaster Flow)

Navigate to **"Live Simulation"** in the sidebar to run the step-by-step emergency workflow:

1. **Medicine Truck Departs Guwahati**: NER-101 departs Guwahati Medical Store with pediatric vaccines for Shillong.
2. **GPS Tracking Active**: Telemetry tracks the vehicle moving at 48 km/h on NH-27.
3. **Severe Weather Detected**: Weather sensors register 175 mm rainfall cloudburst in East Khasi Hills.
4. **ML Disruption Prediction**: Random Forest model calculates **88.4% disruption hazard** due to saturated slopes.
5. **System Alert Broadcast**: Emergency Level-1 alert triggered for disaster management teams.
6. **Field Verification**: Field Officer reports active landslide with geo-coordinates and imagery.
7. **Road Status Flipped**: NH-27 marked 🔴 **BLOCKED** on live GIS system.
8. **Alternate Route Computed**: Routing engine identifies bypass via State Highway SH-01.
9. **Vehicle Rerouted**: Driver console updates with bypass route avoiding hazard zone.
10. **ETA Recalculated**: Schedule dynamically updated with +1h 45m detour delay.
11. **District Accessibility Updated**: East Khasi Hills accessibility index recalculated from 92% to 68%.

---

## 📊 Evaluation & Verification Summary

- **Frontend**: Fully bundled and verified via `vite build` (715 modules transformed, 0 syntax/bundling errors).
- **Backend**: All 9 Mongoose models, auth middleware, and 11 route files validated with clean module load (`test_load.js`: 0 errors).
- **Machine Learning**: 6,000 synthetic NER records trained with Random Forest (`Accuracy: 97.17%`, `ROC-AUC: 0.9801`), model exported to `.joblib` and verified with live Python inference test.
