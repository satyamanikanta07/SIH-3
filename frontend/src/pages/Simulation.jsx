import { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiCheckCircle, FiAlertTriangle, FiTruck, FiCloudRain, FiCpu, FiBell, FiCamera, FiSlash, FiNavigation, FiClock, FiActivity } from 'react-icons/fi';

const SCENARIO_STEPS = [
  {
    step: 1,
    title: 'Medicine Truck Departs Guwahati',
    icon: FiTruck,
    badge: 'Dispatch',
    badgeClass: 'info',
    detail: 'Vehicle NER-101 (Tata 407 Reefer Truck) leaves Guwahati Medical Store carrying critical pediatric vaccines & anti-venom for Shillong Civil Hospital.',
    metrics: { vehicle: 'NER-101', cargo: 'Critical Medicines', origin: 'Guwahati (Kamrup)', destination: 'Shillong (East Khasi Hills)', initialETA: '3h 30m' },
    statusLog: '08:30 AM: NER-101 dispatched. Driver: Rajesh Kumar. Route: NH-27 Guwahati-Shillong Highway.'
  },
  {
    step: 2,
    title: 'GPS Tracking Active & In Motion',
    icon: FiActivity,
    badge: 'Tracking',
    badgeClass: 'moving',
    detail: 'Onboard IoT GPS transponder transmits live telemetry. Vehicle progressing smoothly through Assam plains towards Meghalaya foothills.',
    metrics: { speed: '48 km/h', lat: '26.0841° N', lng: '91.8214° E', odometer: '24 km completed', fuel: '88%' },
    statusLog: '09:05 AM: Telemetry ping confirmed. Vehicle operating at steady speed on NH-27.'
  },
  {
    step: 3,
    title: 'Severe Rainfall Detected in Transit Zone',
    icon: FiCloudRain,
    badge: 'Weather Alert',
    badgeClass: 'warning',
    detail: 'Automated weather stations across Ri-Bhoi & East Khasi Hills register sudden torrential monsoon downpour exceeding 175 mm.',
    metrics: { rainfall: '175.4 mm', humidity: '96%', visibility: '400 m', wind: '28 km/h', soilSaturation: '92%' },
    statusLog: '09:40 AM: Cloudburst alert registered. Precipitation rate elevated across Umiam gorge corridor.'
  },
  {
    step: 4,
    title: 'ML Model Predicts 88% Disruption Probability',
    icon: FiCpu,
    badge: 'AI Prediction',
    badgeClass: 'critical',
    detail: 'Python ML service processes live weather, steep slope data (78%), and historical landslide frequency. Outputs 88% probability of imminent corridor collapse.',
    metrics: { disruptionProbability: '88.4%', riskLevel: 'CRITICAL', mainFactor: 'Saturated hill slope + heavy precipitation', modelConfidence: '94%' },
    statusLog: '09:55 AM: AI Model RF-v2.1 flagged NH-27 Km 42-48 as High Disruption Danger Zone.'
  },
  {
    step: 5,
    title: 'Automated Multi-Agency Alert Generated',
    icon: FiBell,
    badge: 'System Alert',
    badgeClass: 'critical',
    detail: 'The platform broadcasts high-priority emergency notification to regional logistics operations, State Disaster Management Authority, and highway patrols.',
    metrics: { alertId: 'ALT-SIM-099', priority: 'Emergency Level-1', notifiedTeams: 'NER Logistics Ops, Meghalaya PWD, State Police' },
    statusLog: '10:02 AM: Critical Alert broadcasted: "Imminent landslide threat on NH-27 near Umiam Lake".'
  },
  {
    step: 6,
    title: 'Field Officer Reports Landslide with GPS & Photo',
    icon: FiCamera,
    badge: 'Field Verification',
    badgeClass: 'critical',
    detail: 'Field Officer Marbaniang stationed near Barapani confirms mudslide and boulder fall. Submits mobile report with coordinates and live camera verification.',
    metrics: { officer: 'Officer Marbaniang', coordinates: '25.6612° N, 91.8904° E', debrisWidth: '180 meters', lanesBlocked: 'Both (North & South)' },
    statusLog: '10:15 AM: Field Incident INC-0092 logged from mobile app. Severe mudflow covering highway.'
  },
  {
    step: 7,
    title: 'Corridor Status Updated to BLOCKED',
    icon: FiSlash,
    badge: 'Road Closed',
    badgeClass: 'blocked',
    detail: 'Highway NH-27 status instantly shifts from OPEN to BLOCKED on all regional digital maps and dispatch centers. All approaching traffic halted.',
    metrics: { roadId: 'NH-27-01', newStatus: 'BLOCKED', trafficState: 'Diverted', affectedVehicles: '14 commercial carriers' },
    statusLog: '10:18 AM: Central GIS registry locked NH-27. Safety barrier flags active.'
  },
  {
    step: 8,
    title: 'AI Computes Optimal Alternate Route',
    icon: FiNavigation,
    badge: 'Route Engine',
    badgeClass: 'info',
    detail: 'Routing algorithm computes alternate paths avoiding active slide zones. Selects Route B via Nongpoh valley connector & SH-01 with low slope risk.',
    metrics: { alternateRoute: 'Via SH-01 Dawki-Shillong / Nongpoh Bypass', extraDistance: '+26 km', surfaceQuality: 'Fair/All-Weather', slopeRisk: 'Low (22%)' },
    statusLog: '10:22 AM: Intelligent route calculation completed. Safe alternate path generated.'
  },
  {
    step: 9,
    title: 'Medicine Truck Diverted to Alternate Corridor',
    icon: FiTruck,
    badge: 'Rerouted',
    badgeClass: 'moving',
    detail: 'Driver Rajesh Kumar receives turn-by-turn bypass reroute on driver console. Truck safely takes bypass exit before reaching blocked hazard zone.',
    metrics: { vehicleStatus: 'En Route on Alternate', currentSpeed: '32 km/h', cargoCondition: 'Intact (Temp Controlled 4°C)', safetyMargin: '100% Avoidance' },
    statusLog: '10:28 AM: Driver acknowledged bypass route. NER-101 successfully executed bypass maneuver.'
  },
  {
    step: 10,
    title: 'Dynamic ETA Recalculated',
    icon: FiClock,
    badge: 'Recalculation',
    badgeClass: 'warning',
    detail: 'ETA algorithm recalculates transit schedule considering winding bypass terrain and reduced speed limit. Hospital authorities notified of revised arrival.',
    metrics: { originalETA: '12:00 PM', revisedETA: '01:45 PM', additionalDelay: '+1h 45m', arrivalConfidence: 'High' },
    statusLog: '10:35 AM: Revised ETA transmitted to Shillong Civil Hospital pharmacy receiving dock.'
  },
  {
    step: 11,
    title: 'District Accessibility Status Dynamically Updated',
    icon: FiCheckCircle,
    badge: 'Sync Complete',
    badgeClass: 'safe',
    detail: 'East Khasi Hills district accessibility index automatically reflects reduced corridor throughput (drops from 92% to 68%), prioritizing secondary relief corridors.',
    metrics: { district: 'East Khasi Hills', prevScore: '92%', updatedScore: '68%', openRoads: '151', blockedRoads: '21', status: 'Managed Emergency' },
    statusLog: '10:45 AM: Regional Intelligence Dashboard recomputed. Multi-agency situational awareness synchronized.'
  }
];

export default function Simulation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < SCENARIO_STEPS.length) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStep = SCENARIO_STEPS[currentStep - 1];

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>End-to-End Emergency Logistics Simulation</h2>
          <p>Interactive verification of the complete 11-step disaster response and rerouting scenario</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <><FiPause /> Pause Simulation</> : <><FiPlay /> Run Auto-Simulation</>}
          </button>
          <button className="btn btn-outline" onClick={handleReset}>
            <FiRotateCcw /> Reset
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            SCENARIO PROGRESSION: STEP {currentStep} OF {SCENARIO_STEPS.length}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
            {Math.round((currentStep / SCENARIO_STEPS.length) * 100)}% Completed
          </span>
        </div>
        <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            width: `${(currentStep / SCENARIO_STEPS.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #059669)',
            borderRadius: 4,
            transition: 'width 0.4s ease-in-out'
          }} />
        </div>

        {/* Step Buttons */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {SCENARIO_STEPS.map(s => (
            <button
              key={s.step}
              onClick={() => { setIsPlaying(false); setCurrentStep(s.step); }}
              style={{
                flex: '1 0 32px',
                minWidth: 32,
                height: 32,
                borderRadius: '50%',
                border: s.step === currentStep ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                background: s.step < currentStep ? '#059669' : s.step === currentStep ? '#3b82f6' : '#fff',
                color: s.step <= currentStep ? '#fff' : '#64748b',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={s.title}
            >
              {s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Main Focus Area: Active Step Showcase */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}>
                <activeStep.icon />
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  Phase {activeStep.step}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{activeStep.title}</h3>
              </div>
            </div>
            <span className={`badge-status ${activeStep.badgeClass}`}>{activeStep.badge}</span>
          </div>

          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 20 }}>
            {activeStep.detail}
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#334155' }}>Live Telemetry & Intelligence Parameters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {Object.entries(activeStep.metrics).map(([key, val]) => (
                <div key={key} style={{ background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-outline"
              disabled={currentStep === 1}
              onClick={() => { setIsPlaying(false); setCurrentStep(prev => prev - 1); }}
            >
              ← Previous Step
            </button>
            <button
              className="btn btn-primary"
              disabled={currentStep === SCENARIO_STEPS.length}
              onClick={() => { setIsPlaying(false); setCurrentStep(prev => prev + 1); }}
            >
              Next Step →
            </button>
          </div>
        </div>

        {/* Live Timeline Audit Log */}
        <div className="card">
          <div className="card-header">
            <h3>📜 Event Sequence Log</h3>
            <span className="badge-status info" style={{ fontSize: 11 }}>Real-Time</span>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SCENARIO_STEPS.slice(0, currentStep).map((item) => (
              <div key={item.step} style={{
                borderLeft: `3px solid ${item.step === currentStep ? 'var(--primary)' : '#cbd5e1'}`,
                paddingLeft: 12,
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                  Step {item.step} • {item.title}
                </div>
                <div style={{ fontSize: 12.5, color: '#334155', marginTop: 2 }}>
                  {item.statusLog}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
