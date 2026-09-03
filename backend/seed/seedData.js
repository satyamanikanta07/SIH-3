const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const District = require('../models/District');
const Road = require('../models/Road');
const Vehicle = require('../models/Vehicle');
const Incident = require('../models/Incident');
const Delivery = require('../models/Delivery');
const Alert = require('../models/Alert');
const WeatherData = require('../models/WeatherData');
const FieldReport = require('../models/FieldReport');
const Route = require('../models/Route');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ner_logistics';

// NER Districts with real coordinates
const districts = [
  { name: 'Kamrup Metropolitan', state: 'Assam', code: 'KAM', center: { lat: 26.1445, lng: 91.7362 }, population: 1253938, area: 1528, accessibilityScore: 92, totalRoads: 340, openRoads: 310, riskyRoads: 22, blockedRoads: 8, riskLevel: 'Low', connectivity: 'Good' },
  { name: 'East Khasi Hills', state: 'Meghalaya', code: 'EKH', center: { lat: 25.5788, lng: 91.8933 }, population: 825922, area: 2748, accessibilityScore: 72, totalRoads: 210, openRoads: 152, riskyRoads: 38, blockedRoads: 20, riskLevel: 'Medium', connectivity: 'Moderate' },
  { name: 'Imphal West', state: 'Manipur', code: 'IMW', center: { lat: 24.8170, lng: 93.9368 }, population: 517992, area: 519, accessibilityScore: 68, totalRoads: 185, openRoads: 128, riskyRoads: 35, blockedRoads: 22, riskLevel: 'Medium', connectivity: 'Moderate' },
  { name: 'Aizawl', state: 'Mizoram', code: 'AIZ', center: { lat: 23.7271, lng: 92.7176 }, population: 404054, area: 3576, accessibilityScore: 65, totalRoads: 160, openRoads: 105, riskyRoads: 32, blockedRoads: 23, riskLevel: 'High', connectivity: 'Poor' },
  { name: 'Dimapur', state: 'Nagaland', code: 'DIM', center: { lat: 25.9065, lng: 93.7272 }, population: 378811, area: 927, accessibilityScore: 70, totalRoads: 175, openRoads: 122, riskyRoads: 33, blockedRoads: 20, riskLevel: 'Medium', connectivity: 'Moderate' },
  { name: 'East Sikkim', state: 'Sikkim', code: 'ESK', center: { lat: 27.3389, lng: 88.6065 }, population: 283583, area: 954, accessibilityScore: 60, totalRoads: 140, openRoads: 88, riskyRoads: 30, blockedRoads: 22, riskLevel: 'High', connectivity: 'Poor' },
  { name: 'West Tripura', state: 'Tripura', code: 'WTR', center: { lat: 23.8315, lng: 91.2868 }, population: 917534, area: 943, accessibilityScore: 78, totalRoads: 195, openRoads: 155, riskyRoads: 25, blockedRoads: 15, riskLevel: 'Low', connectivity: 'Moderate' },
  { name: 'West Garo Hills', state: 'Meghalaya', code: 'WGH', center: { lat: 25.5166, lng: 90.2223 }, population: 643291, area: 3714, accessibilityScore: 55, totalRoads: 130, openRoads: 72, riskyRoads: 35, blockedRoads: 23, riskLevel: 'High', connectivity: 'Poor' },
  { name: 'Tinsukia', state: 'Assam', code: 'TIN', center: { lat: 27.4889, lng: 95.3547 }, population: 1327929, area: 3790, accessibilityScore: 75, totalRoads: 220, openRoads: 168, riskyRoads: 30, blockedRoads: 22, riskLevel: 'Medium', connectivity: 'Moderate' },
  { name: 'Kohima', state: 'Nagaland', code: 'KOH', center: { lat: 25.6586, lng: 94.1086 }, population: 270063, area: 1463, accessibilityScore: 58, totalRoads: 145, openRoads: 85, riskyRoads: 35, blockedRoads: 25, riskLevel: 'High', connectivity: 'Poor' },
  { name: 'Ri-Bhoi', state: 'Meghalaya', code: 'RBH', center: { lat: 25.8800, lng: 91.8600 }, population: 258380, area: 2378, accessibilityScore: 66, totalRoads: 155, openRoads: 102, riskyRoads: 30, blockedRoads: 23, riskLevel: 'Medium', connectivity: 'Moderate' },
  { name: 'Sonitpur', state: 'Assam', code: 'SON', center: { lat: 26.6800, lng: 92.9800 }, population: 1924110, area: 5324, accessibilityScore: 80, totalRoads: 260, openRoads: 210, riskyRoads: 30, blockedRoads: 20, riskLevel: 'Low', connectivity: 'Good' }
];

// NER Roads data
const roads = [
  { roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong Highway', type: 'NH', status: 'Open', riskLevel: 'Medium', district: 'Kamrup Metropolitan', state: 'Assam', startPoint: { name: 'Guwahati', coordinates: { lat: 26.1445, lng: 91.7362 } }, endPoint: { name: 'Shillong', coordinates: { lat: 25.5788, lng: 91.8933 } }, length: 103, condition: 'Fair', terrain: 'Hilly', trafficLevel: 'Heavy', disruptionProbability: 42, floodRisk: 'Medium', landslideRisk: 'High', historicalIncidents: 12 },
  { roadId: 'NH-37-01', name: 'NH-37 Guwahati-Dimapur', type: 'NH', status: 'Open', riskLevel: 'Low', district: 'Kamrup Metropolitan', state: 'Assam', startPoint: { name: 'Guwahati', coordinates: { lat: 26.1445, lng: 91.7362 } }, endPoint: { name: 'Dimapur', coordinates: { lat: 25.9065, lng: 93.7272 } }, length: 320, condition: 'Good', terrain: 'Plain', trafficLevel: 'Moderate', disruptionProbability: 18, floodRisk: 'Low', landslideRisk: 'Low', historicalIncidents: 4 },
  { roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur Highway', type: 'NH', status: 'Risky', riskLevel: 'High', district: 'Imphal West', state: 'Manipur', startPoint: { name: 'Imphal', coordinates: { lat: 24.8170, lng: 93.9368 } }, endPoint: { name: 'Dimapur', coordinates: { lat: 25.9065, lng: 93.7272 } }, length: 215, condition: 'Poor', terrain: 'Mountainous', trafficLevel: 'Heavy', disruptionProbability: 78, floodRisk: 'Medium', landslideRisk: 'High', historicalIncidents: 18 },
  { roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar Road', type: 'NH', status: 'Blocked', riskLevel: 'Critical', district: 'Aizawl', state: 'Mizoram', startPoint: { name: 'Aizawl', coordinates: { lat: 23.7271, lng: 92.7176 } }, endPoint: { name: 'Silchar', coordinates: { lat: 24.8333, lng: 92.7789 } }, length: 180, condition: 'Very Poor', terrain: 'Mountainous', trafficLevel: 'Standstill', disruptionProbability: 95, floodRisk: 'High', landslideRisk: 'High', historicalIncidents: 22 },
  { roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri Highway', type: 'NH', status: 'Risky', riskLevel: 'High', district: 'East Sikkim', state: 'Sikkim', startPoint: { name: 'Gangtok', coordinates: { lat: 27.3389, lng: 88.6065 } }, endPoint: { name: 'Siliguri', coordinates: { lat: 26.7271, lng: 88.3953 } }, length: 114, condition: 'Fair', terrain: 'Mountainous', trafficLevel: 'Heavy', disruptionProbability: 65, floodRisk: 'Medium', landslideRisk: 'High', historicalIncidents: 15 },
  { roadId: 'SH-01-ML', name: 'Shillong-Dawki Road', type: 'SH', status: 'Open', riskLevel: 'Medium', district: 'East Khasi Hills', state: 'Meghalaya', startPoint: { name: 'Shillong', coordinates: { lat: 25.5788, lng: 91.8933 } }, endPoint: { name: 'Dawki', coordinates: { lat: 25.1873, lng: 92.0238 } }, length: 82, condition: 'Fair', terrain: 'Hilly', trafficLevel: 'Moderate', disruptionProbability: 35, floodRisk: 'Medium', landslideRisk: 'Medium', historicalIncidents: 8 },
  { roadId: 'SH-02-TR', name: 'Agartala-Udaipur Road', type: 'SH', status: 'Open', riskLevel: 'Low', district: 'West Tripura', state: 'Tripura', startPoint: { name: 'Agartala', coordinates: { lat: 23.8315, lng: 91.2868 } }, endPoint: { name: 'Udaipur', coordinates: { lat: 23.5333, lng: 91.4833 } }, length: 55, condition: 'Good', terrain: 'Plain', trafficLevel: 'Low', disruptionProbability: 12, floodRisk: 'Low', landslideRisk: 'Low', historicalIncidents: 2 },
  { roadId: 'NH-29-AS', name: 'NH-29 Tinsukia-Doom Dooma', type: 'NH', status: 'Open', riskLevel: 'Low', district: 'Tinsukia', state: 'Assam', startPoint: { name: 'Tinsukia', coordinates: { lat: 27.4889, lng: 95.3547 } }, endPoint: { name: 'Doom Dooma', coordinates: { lat: 27.5697, lng: 95.5719 } }, length: 45, condition: 'Good', terrain: 'Plain', trafficLevel: 'Low', disruptionProbability: 8, floodRisk: 'Medium', landslideRisk: 'Low', historicalIncidents: 3 },
  { roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', type: 'NH', status: 'Blocked', riskLevel: 'Critical', district: 'Kohima', state: 'Nagaland', startPoint: { name: 'Kohima', coordinates: { lat: 25.6586, lng: 94.1086 } }, endPoint: { name: 'Imphal', coordinates: { lat: 24.8170, lng: 93.9368 } }, length: 137, condition: 'Very Poor', terrain: 'Mountainous', trafficLevel: 'Standstill', disruptionProbability: 92, floodRisk: 'High', landslideRisk: 'High', historicalIncidents: 25 },
  { roadId: 'DR-01-RB', name: 'Nongpoh-Umiam Road', type: 'District', status: 'Open', riskLevel: 'Medium', district: 'Ri-Bhoi', state: 'Meghalaya', startPoint: { name: 'Nongpoh', coordinates: { lat: 25.8800, lng: 91.8600 } }, endPoint: { name: 'Umiam', coordinates: { lat: 25.6700, lng: 91.8800 } }, length: 28, condition: 'Fair', terrain: 'Hilly', trafficLevel: 'Low', disruptionProbability: 28, floodRisk: 'Low', landslideRisk: 'Medium', historicalIncidents: 5 },
  { roadId: 'SH-03-WG', name: 'Tura-Dalu Road', type: 'SH', status: 'Risky', riskLevel: 'High', district: 'West Garo Hills', state: 'Meghalaya', startPoint: { name: 'Tura', coordinates: { lat: 25.5166, lng: 90.2223 } }, endPoint: { name: 'Dalu', coordinates: { lat: 25.2250, lng: 90.1766 } }, length: 65, condition: 'Poor', terrain: 'Hilly', trafficLevel: 'Moderate', disruptionProbability: 58, floodRisk: 'High', landslideRisk: 'Medium', historicalIncidents: 10 },
  { roadId: 'NH-15-AS', name: 'NH-15 Tezpur Highway', type: 'NH', status: 'Open', riskLevel: 'Low', district: 'Sonitpur', state: 'Assam', startPoint: { name: 'Tezpur', coordinates: { lat: 26.6800, lng: 92.9800 } }, endPoint: { name: 'Guwahati', coordinates: { lat: 26.1445, lng: 91.7362 } }, length: 185, condition: 'Good', terrain: 'Plain', trafficLevel: 'Moderate', disruptionProbability: 15, floodRisk: 'Medium', landslideRisk: 'Low', historicalIncidents: 6 },
  { roadId: 'BR-01-KAM', name: 'Saraighat Bridge', type: 'Bridge', status: 'Open', riskLevel: 'Medium', district: 'Kamrup Metropolitan', state: 'Assam', startPoint: { name: 'North Guwahati', coordinates: { lat: 26.2000, lng: 91.7200 } }, endPoint: { name: 'Guwahati', coordinates: { lat: 26.1700, lng: 91.7300 } }, length: 1.5, condition: 'Fair', terrain: 'Riverine', trafficLevel: 'Heavy', disruptionProbability: 30, floodRisk: 'High', landslideRisk: 'Low', historicalIncidents: 3, bridgeCondition: 'Fair' },
  { roadId: 'DR-02-DIM', name: 'Dimapur-Kohima District Road', type: 'District', status: 'Risky', riskLevel: 'Medium', district: 'Dimapur', state: 'Nagaland', startPoint: { name: 'Dimapur', coordinates: { lat: 25.9065, lng: 93.7272 } }, endPoint: { name: 'Kohima', coordinates: { lat: 25.6586, lng: 94.1086 } }, length: 74, condition: 'Fair', terrain: 'Mountainous', trafficLevel: 'Moderate', disruptionProbability: 45, floodRisk: 'Medium', landslideRisk: 'High', historicalIncidents: 9 },
];

// Vehicles
const vehicles = [
  { vehicleId: 'NER-101', registrationNumber: 'AS-01-AB-1234', type: 'Truck', driver: { name: 'Rajesh Kumar', phone: '9876543210' }, currentLocation: { lat: 26.12, lng: 91.85, address: 'Near Jorabat, Assam' }, origin: { name: 'Guwahati', lat: 26.1445, lng: 91.7362 }, destination: { name: 'Shillong', lat: 25.5788, lng: 91.8933 }, cargo: 'Medicines', cargoPriority: 'Critical', status: 'Moving', currentSpeed: 35, eta: new Date(Date.now() + 4 * 3600000), currentRoute: 'NH-27-01', fuelLevel: 72, distanceCovered: 32, totalDistance: 103, isActive: true },
  { vehicleId: 'NER-102', registrationNumber: 'ML-05-CD-5678', type: 'Truck', driver: { name: 'Bimal Das', phone: '9876543211' }, currentLocation: { lat: 25.65, lng: 91.90, address: 'Nongpoh, Meghalaya' }, origin: { name: 'Shillong', lat: 25.5788, lng: 91.8933 }, destination: { name: 'Tura', lat: 25.5166, lng: 90.2223 }, cargo: 'Food', cargoPriority: 'High', status: 'Moving', currentSpeed: 28, eta: new Date(Date.now() + 7 * 3600000), currentRoute: 'SH-01-ML', fuelLevel: 58, distanceCovered: 45, totalDistance: 220, isActive: true },
  { vehicleId: 'NER-103', registrationNumber: 'MN-01-EF-9012', type: 'Ambulance', driver: { name: 'Tomba Singh', phone: '9876543212' }, currentLocation: { lat: 24.90, lng: 93.88, address: 'Near Kangpokpi, Manipur' }, origin: { name: 'Imphal', lat: 24.8170, lng: 93.9368 }, destination: { name: 'Churachandpur', lat: 24.3333, lng: 93.6833 }, cargo: 'Emergency', cargoPriority: 'Critical', status: 'Moving', currentSpeed: 42, eta: new Date(Date.now() + 2 * 3600000), currentRoute: 'NH-02-MN', fuelLevel: 85, distanceCovered: 28, totalDistance: 60, isActive: true },
  { vehicleId: 'NER-104', registrationNumber: 'AS-12-GH-3456', type: 'Truck', driver: { name: 'Abdul Rahman', phone: '9876543213' }, currentLocation: { lat: 26.85, lng: 93.50, address: 'Near Nagaon, Assam' }, origin: { name: 'Guwahati', lat: 26.1445, lng: 91.7362 }, destination: { name: 'Dimapur', lat: 25.9065, lng: 93.7272 }, cargo: 'Construction', cargoPriority: 'Medium', status: 'Delayed', currentSpeed: 0, eta: new Date(Date.now() + 8 * 3600000), currentRoute: 'NH-37-01', fuelLevel: 45, distanceCovered: 180, totalDistance: 320, isActive: true },
  { vehicleId: 'NER-105', registrationNumber: 'SK-01-IJ-7890', type: 'Van', driver: { name: 'Pempa Sherpa', phone: '9876543214' }, currentLocation: { lat: 27.20, lng: 88.55, address: 'Near Rangpo, Sikkim' }, origin: { name: 'Siliguri', lat: 26.7271, lng: 88.3953 }, destination: { name: 'Gangtok', lat: 27.3389, lng: 88.6065 }, cargo: 'Medicines', cargoPriority: 'Critical', status: 'At Risk', currentSpeed: 15, eta: new Date(Date.now() + 3 * 3600000), currentRoute: 'NH-10-SK', fuelLevel: 62, distanceCovered: 75, totalDistance: 114, isActive: true },
  { vehicleId: 'NER-106', registrationNumber: 'TR-01-KL-2345', type: 'Truck', driver: { name: 'Subhash Debnath', phone: '9876543215' }, currentLocation: { lat: 23.78, lng: 91.35, address: 'Near Agartala, Tripura' }, origin: { name: 'Agartala', lat: 23.8315, lng: 91.2868 }, destination: { name: 'Udaipur', lat: 23.5333, lng: 91.4833 }, cargo: 'Agricultural', cargoPriority: 'Medium', status: 'Moving', currentSpeed: 38, eta: new Date(Date.now() + 1.5 * 3600000), currentRoute: 'SH-02-TR', fuelLevel: 80, distanceCovered: 20, totalDistance: 55, isActive: true },
  { vehicleId: 'NER-107', registrationNumber: 'NL-07-MN-6789', type: 'Tanker', driver: { name: 'Kevi Zhimo', phone: '9876543216' }, currentLocation: { lat: 25.85, lng: 93.80, address: 'Near Chumukedima, Nagaland' }, origin: { name: 'Dimapur', lat: 25.9065, lng: 93.7272 }, destination: { name: 'Kohima', lat: 25.6586, lng: 94.1086 }, cargo: 'Fuel', cargoPriority: 'High', status: 'Stopped', currentSpeed: 0, eta: new Date(Date.now() + 5 * 3600000), currentRoute: 'DR-02-DIM', fuelLevel: 95, distanceCovered: 12, totalDistance: 74, isActive: true },
  { vehicleId: 'NER-108', registrationNumber: 'MZ-01-OP-1234', type: 'Truck', driver: { name: 'Lalthianga', phone: '9876543217' }, currentLocation: { lat: 23.80, lng: 92.72, address: 'Near Vairengte, Mizoram' }, origin: { name: 'Silchar', lat: 24.8333, lng: 92.7789 }, destination: { name: 'Aizawl', lat: 23.7271, lng: 92.7176 }, cargo: 'Food', cargoPriority: 'Critical', status: 'Delayed', currentSpeed: 0, eta: new Date(Date.now() + 12 * 3600000), currentRoute: 'NH-06-MZ', fuelLevel: 35, distanceCovered: 120, totalDistance: 180, isActive: true },
  { vehicleId: 'NER-109', registrationNumber: 'AS-25-QR-5678', type: 'Truck', driver: { name: 'Mohan Bora', phone: '9876543218' }, currentLocation: { lat: 27.45, lng: 95.30, address: 'Near Tinsukia, Assam' }, origin: { name: 'Tinsukia', lat: 27.4889, lng: 95.3547 }, destination: { name: 'Doom Dooma', lat: 27.5697, lng: 95.5719 }, cargo: 'Agricultural', cargoPriority: 'Low', status: 'Moving', currentSpeed: 42, eta: new Date(Date.now() + 1 * 3600000), currentRoute: 'NH-29-AS', fuelLevel: 88, distanceCovered: 15, totalDistance: 45, isActive: true },
  { vehicleId: 'NER-110', registrationNumber: 'AS-01-ST-9012', type: 'Pickup', driver: { name: 'Deepak Kalita', phone: '9876543219' }, currentLocation: { lat: 26.50, lng: 92.80, address: 'Near Tezpur, Assam' }, origin: { name: 'Tezpur', lat: 26.6800, lng: 92.9800 }, destination: { name: 'Guwahati', lat: 26.1445, lng: 91.7362 }, cargo: 'General', cargoPriority: 'Low', status: 'Moving', currentSpeed: 55, eta: new Date(Date.now() + 3.5 * 3600000), currentRoute: 'NH-15-AS', fuelLevel: 65, distanceCovered: 40, totalDistance: 185, isActive: true },
];

// Incidents
const incidents = [
  { incidentId: 'INC-0001', type: 'Landslide', location: { name: 'NH-27 near Umiam Lake', district: 'East Khasi Hills', state: 'Meghalaya', coordinates: { lat: 25.65, lng: 91.88 } }, severity: 'Critical', description: 'Major landslide blocking both lanes of NH-27 near Umiam Lake. Debris covers approximately 200m of road.', reportedBy: { name: 'Field Officer Marbaniang', role: 'field_officer' }, status: 'Confirmed', affectedRoads: ['NH-27-01'], affectedVehicles: ['NER-101', 'NER-102'] },
  { incidentId: 'INC-0002', type: 'Flood', location: { name: 'Brahmaputra River Area, Tezpur', district: 'Sonitpur', state: 'Assam', coordinates: { lat: 26.63, lng: 92.80 } }, severity: 'High', description: 'Rising water levels of Brahmaputra threatening NH-15 near Tezpur. Water level 1.2m above danger mark.', reportedBy: { name: 'District Officer Singh', role: 'government_official' }, status: 'Under Investigation', affectedRoads: ['NH-15-AS'], affectedVehicles: ['NER-110'] },
  { incidentId: 'INC-0003', type: 'Road Damage', location: { name: 'NH-39 Kohima Section', district: 'Kohima', state: 'Nagaland', coordinates: { lat: 25.70, lng: 94.05 } }, severity: 'Critical', description: 'Severe road damage on NH-39 due to continuous heavy rainfall. Multiple potholes and road subsidence.', reportedBy: { name: 'Highway Engineer Lotha', role: 'government_official' }, status: 'Confirmed', affectedRoads: ['NH-39-NL'], affectedVehicles: [] },
  { incidentId: 'INC-0004', type: 'Bridge Damage', location: { name: 'Old Bridge near Nongpoh', district: 'Ri-Bhoi', state: 'Meghalaya', coordinates: { lat: 25.90, lng: 91.87 } }, severity: 'Medium', description: 'Structural cracks observed in old bridge near Nongpoh. Bridge capacity reduced to single lane.', reportedBy: { name: 'PWD Inspector Khongwir', role: 'government_official' }, status: 'Under Investigation', affectedRoads: ['DR-01-RB'], affectedVehicles: [] },
  { incidentId: 'INC-0005', type: 'Weather Hazard', location: { name: 'NH-6 Aizawl-Silchar Highway', district: 'Aizawl', state: 'Mizoram', coordinates: { lat: 23.75, lng: 92.73 } }, severity: 'Critical', description: 'Dense fog and heavy rainfall causing near-zero visibility on NH-6. Multiple vehicles stranded.', reportedBy: { name: 'Traffic Controller Lalmuanpuia', role: 'field_officer' }, status: 'Confirmed', affectedRoads: ['NH-06-MZ'], affectedVehicles: ['NER-108'] },
  { incidentId: 'INC-0006', type: 'Landslide', location: { name: 'NH-10 Near Rangpo', district: 'East Sikkim', state: 'Sikkim', coordinates: { lat: 27.18, lng: 88.53 } }, severity: 'High', description: 'Minor landslide on NH-10 near Rangpo checkpoint. One lane partially blocked with loose debris.', reportedBy: { name: 'Border Officer Tamang', role: 'field_officer' }, status: 'Reported', affectedRoads: ['NH-10-SK'], affectedVehicles: ['NER-105'] },
  { incidentId: 'INC-0007', type: 'Heavy Traffic', location: { name: 'Dimapur Market Area', district: 'Dimapur', state: 'Nagaland', coordinates: { lat: 25.91, lng: 93.73 } }, severity: 'Low', description: 'Heavy traffic congestion near Dimapur main market due to weekly bazaar. Expected to clear by evening.', reportedBy: { name: 'Traffic Police Sema', role: 'field_officer' }, status: 'Reported', affectedRoads: ['DR-02-DIM'], affectedVehicles: ['NER-107'] },
  { incidentId: 'INC-0008', type: 'Accident', location: { name: 'NH-2 near Mao Gate', district: 'Imphal West', state: 'Manipur', coordinates: { lat: 25.00, lng: 93.90 } }, severity: 'Medium', description: 'Two-vehicle collision on NH-2 near Mao Gate. No casualties. Road partially cleared.', reportedBy: { name: 'Police Inspector Meitei', role: 'field_officer' }, status: 'Confirmed', affectedRoads: ['NH-02-MN'], affectedVehicles: ['NER-103'] },
];

// Deliveries
const deliveries = [
  { deliveryId: 'DEL-0001', vehicleId: 'NER-101', cargo: 'Medicines', cargoDescription: 'Essential medicines and vaccines for district hospital', origin: { name: 'Guwahati Medical Store', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362 }, destination: { name: 'Shillong Civil Hospital', district: 'East Khasi Hills', lat: 25.5788, lng: 91.8933 }, priority: 'Critical', status: 'In Transit', eta: new Date(Date.now() + 4 * 3600000), delay: 45, route: 'NH-27-01', weight: 500 },
  { deliveryId: 'DEL-0002', vehicleId: 'NER-102', cargo: 'Food', cargoDescription: 'Emergency food supplies - rice, dal, and cooking oil', origin: { name: 'Shillong Warehouse', district: 'East Khasi Hills', lat: 25.5788, lng: 91.8933 }, destination: { name: 'Tura Relief Camp', district: 'West Garo Hills', lat: 25.5166, lng: 90.2223 }, priority: 'High', status: 'In Transit', eta: new Date(Date.now() + 7 * 3600000), delay: 0, route: 'SH-03-WG', weight: 2000 },
  { deliveryId: 'DEL-0003', vehicleId: 'NER-103', cargo: 'Emergency', cargoDescription: 'Emergency medical team and equipment', origin: { name: 'RIMS Hospital Imphal', district: 'Imphal West', lat: 24.8170, lng: 93.9368 }, destination: { name: 'Churachandpur District Hospital', district: 'Imphal West', lat: 24.3333, lng: 93.6833 }, priority: 'Critical', status: 'In Transit', eta: new Date(Date.now() + 2 * 3600000), delay: 0, route: 'NH-02-MN', weight: 200 },
  { deliveryId: 'DEL-0004', vehicleId: 'NER-104', cargo: 'Construction', cargoDescription: 'Road repair materials - cement, steel, and bitumen', origin: { name: 'Guwahati Construction Yard', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362 }, destination: { name: 'Dimapur PWD Office', district: 'Dimapur', lat: 25.9065, lng: 93.7272 }, priority: 'Medium', status: 'Delayed', eta: new Date(Date.now() + 8 * 3600000), delay: 120, route: 'NH-37-01', weight: 5000 },
  { deliveryId: 'DEL-0005', vehicleId: 'NER-105', cargo: 'Medicines', cargoDescription: 'Anti-malaria drugs and first aid kits', origin: { name: 'Siliguri Medical Depot', district: 'East Sikkim', lat: 26.7271, lng: 88.3953 }, destination: { name: 'Gangtok Health Center', district: 'East Sikkim', lat: 27.3389, lng: 88.6065 }, priority: 'Critical', status: 'At Risk', eta: new Date(Date.now() + 3 * 3600000), delay: 90, route: 'NH-10-SK', weight: 350 },
  { deliveryId: 'DEL-0006', vehicleId: 'NER-106', cargo: 'Agricultural', cargoDescription: 'Seeds and fertilizers for monsoon season', origin: { name: 'Agartala Agri Depot', district: 'West Tripura', lat: 23.8315, lng: 91.2868 }, destination: { name: 'Udaipur Farm Center', district: 'West Tripura', lat: 23.5333, lng: 91.4833 }, priority: 'Medium', status: 'In Transit', eta: new Date(Date.now() + 1.5 * 3600000), delay: 0, route: 'SH-02-TR', weight: 3000 },
  { deliveryId: 'DEL-0007', vehicleId: 'NER-107', cargo: 'Fuel', cargoDescription: 'Diesel fuel for Kohima power station', origin: { name: 'Dimapur Fuel Depot', district: 'Dimapur', lat: 25.9065, lng: 93.7272 }, destination: { name: 'Kohima Power Station', district: 'Kohima', lat: 25.6586, lng: 94.1086 }, priority: 'High', status: 'Delayed', eta: new Date(Date.now() + 5 * 3600000), delay: 180, route: 'DR-02-DIM', weight: 8000 },
  { deliveryId: 'DEL-0008', vehicleId: 'NER-108', cargo: 'Food', cargoDescription: 'Essential food supplies for Aizawl central warehouse', origin: { name: 'Silchar Supply Center', district: 'Aizawl', lat: 24.8333, lng: 92.7789 }, destination: { name: 'Aizawl Central Warehouse', district: 'Aizawl', lat: 23.7271, lng: 92.7176 }, priority: 'Critical', status: 'Delayed', eta: new Date(Date.now() + 12 * 3600000), delay: 360, route: 'NH-06-MZ', weight: 4000 },
  { deliveryId: 'DEL-0009', vehicleId: 'NER-109', cargo: 'Agricultural', cargoDescription: 'Tea processing equipment', origin: { name: 'Tinsukia Tea Depot', district: 'Tinsukia', lat: 27.4889, lng: 95.3547 }, destination: { name: 'Doom Dooma Tea Estate', district: 'Tinsukia', lat: 27.5697, lng: 95.5719 }, priority: 'Low', status: 'In Transit', eta: new Date(Date.now() + 1 * 3600000), delay: 0, route: 'NH-29-AS', weight: 1500 },
  { deliveryId: 'DEL-0010', vehicleId: 'NER-110', cargo: 'General', cargoDescription: 'Government office supplies and equipment', origin: { name: 'Tezpur Supply Office', district: 'Sonitpur', lat: 26.6800, lng: 92.9800 }, destination: { name: 'Guwahati Secretariat', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362 }, priority: 'Low', status: 'In Transit', eta: new Date(Date.now() + 3.5 * 3600000), delay: 0, route: 'NH-15-AS', weight: 800 },
  { deliveryId: 'DEL-0011', vehicleId: 'NER-101', cargo: 'Medicines', cargoDescription: 'COVID vaccines batch #2847', origin: { name: 'Guwahati Cold Storage', district: 'Kamrup Metropolitan', lat: 26.15, lng: 91.74 }, destination: { name: 'Kohima District Hospital', district: 'Kohima', lat: 25.6586, lng: 94.1086 }, priority: 'Critical', status: 'Pending', eta: new Date(Date.now() + 24 * 3600000), delay: 0, weight: 100 },
  { deliveryId: 'DEL-0012', vehicleId: 'NER-102', cargo: 'Emergency', cargoDescription: 'Flood relief materials - tents and blankets', origin: { name: 'NDRF Guwahati', district: 'Kamrup Metropolitan', lat: 26.14, lng: 91.73 }, destination: { name: 'Sonitpur Relief Camp', district: 'Sonitpur', lat: 26.68, lng: 92.98 }, priority: 'Critical', status: 'Delivered', eta: new Date(Date.now() - 2 * 3600000), delay: 30, weight: 1200 },
];

// Alerts
const alerts = [
  { alertId: 'ALT-0001', type: 'Road Blockage', severity: 'Critical', title: 'NH-6 Aizawl-Silchar Road Blocked', message: 'Road completely blocked due to landslide and heavy rainfall. 3 vehicles stranded. Alternate route via Tripura recommended.', location: { name: 'NH-6 near Vairengte', district: 'Aizawl', lat: 23.80, lng: 92.72 }, affectedEntities: { roads: ['NH-06-MZ'], vehicles: ['NER-108'], deliveries: ['DEL-0008'], districts: ['Aizawl'] }, alternateRouteAvailable: true },
  { alertId: 'ALT-0002', type: 'High Disruption Risk', severity: 'Critical', title: 'NH-39 Kohima-Imphal High Risk', message: 'ML model predicts 92% disruption probability for NH-39. Continuous heavy rainfall and historical landslide data indicate imminent road closure.', location: { name: 'NH-39 Kohima', district: 'Kohima', lat: 25.66, lng: 94.11 }, affectedEntities: { roads: ['NH-39-NL'], vehicles: [], deliveries: [], districts: ['Kohima', 'Imphal West'] } },
  { alertId: 'ALT-0003', type: 'Heavy Rainfall', severity: 'Warning', title: 'Heavy Rainfall Alert - Meghalaya', message: 'IMD warns of heavy to very heavy rainfall (150-200mm) expected in East Khasi Hills and Ri-Bhoi districts over next 48 hours.', location: { name: 'East Khasi Hills', district: 'East Khasi Hills', lat: 25.58, lng: 91.89 }, affectedEntities: { roads: ['NH-27-01', 'SH-01-ML', 'DR-01-RB'], vehicles: ['NER-101', 'NER-102'], districts: ['East Khasi Hills', 'Ri-Bhoi'] } },
  { alertId: 'ALT-0004', type: 'Flood Risk', severity: 'Warning', title: 'Brahmaputra Flood Warning', message: 'Water level rising at Tezpur. Flood warning issued for low-lying areas near NH-15. Vehicles advised to use alternate routes.', location: { name: 'Tezpur, Sonitpur', district: 'Sonitpur', lat: 26.63, lng: 92.80 }, affectedEntities: { roads: ['NH-15-AS'], vehicles: ['NER-110'], deliveries: ['DEL-0010'], districts: ['Sonitpur'] }, alternateRouteAvailable: true },
  { alertId: 'ALT-0005', type: 'Vehicle Delay', severity: 'Warning', title: 'Medicine Delivery NER-105 At Risk', message: 'Critical medicine delivery to Gangtok Health Center is at risk due to landslide on NH-10. Current delay: 90 minutes.', location: { name: 'NH-10 near Rangpo', district: 'East Sikkim', lat: 27.18, lng: 88.53 }, affectedEntities: { vehicles: ['NER-105'], deliveries: ['DEL-0005'], districts: ['East Sikkim'] } },
  { alertId: 'ALT-0006', type: 'Delivery Delay', severity: 'Critical', title: 'Food Supply to Aizawl Critically Delayed', message: 'Essential food delivery DEL-0008 to Aizawl is delayed by 6 hours. Road blocked on NH-6. Aizawl has 3-day food reserves remaining.', location: { name: 'Aizawl', district: 'Aizawl', lat: 23.73, lng: 92.72 }, affectedEntities: { vehicles: ['NER-108'], deliveries: ['DEL-0008'], districts: ['Aizawl'] } },
  { alertId: 'ALT-0007', type: 'Landslide Risk', severity: 'Warning', title: 'Landslide Risk on Tura-Dalu Road', message: 'Soil saturation levels critical in West Garo Hills. SH-03 may experience landslides within next 24 hours.', location: { name: 'Tura-Dalu Road', district: 'West Garo Hills', lat: 25.40, lng: 90.20 }, affectedEntities: { roads: ['SH-03-WG'], districts: ['West Garo Hills'] } },
  { alertId: 'ALT-0008', type: 'Accessibility Reduction', severity: 'Warning', title: 'Kohima District Accessibility Declining', message: 'Kohima district accessibility score dropped to 58%. 25 roads blocked. Essential supply chain at risk.', location: { name: 'Kohima', district: 'Kohima', lat: 25.66, lng: 94.11 }, affectedEntities: { districts: ['Kohima'] } },
  { alertId: 'ALT-0009', type: 'Bridge Alert', severity: 'Info', title: 'Saraighat Bridge Load Restriction', message: 'Load restriction implemented on Saraighat Bridge. Heavy vehicles above 20 tons redirected to new bridge.', location: { name: 'Saraighat Bridge', district: 'Kamrup Metropolitan', lat: 26.18, lng: 91.72 }, affectedEntities: { roads: ['BR-01-KAM'], districts: ['Kamrup Metropolitan'] }, isRead: true },
  { alertId: 'ALT-0010', type: 'Weather Warning', severity: 'Info', title: 'Fog Advisory - Assam Plains', message: 'Dense fog expected in Assam plains during early morning hours. Reduced visibility on NH-37 and NH-15. Drivers advised caution.', location: { name: 'Assam Plains', district: 'Kamrup Metropolitan', lat: 26.14, lng: 91.74 }, affectedEntities: { roads: ['NH-37-01', 'NH-15-AS'], districts: ['Kamrup Metropolitan', 'Sonitpur'] }, isRead: true },
];

// Weather data
const weatherData = [
  { district: 'Kamrup Metropolitan', state: 'Assam', temperature: 28, rainfall: 45, humidity: 82, windSpeed: 12, condition: 'Light Rain', floodRisk: 'Low', warning: '', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Cloudy', tempHigh: 30, tempLow: 22, rainfall: 30, floodRisk: 'Low' }, { date: new Date(Date.now() + 172800000), condition: 'Heavy Rain', tempHigh: 27, tempLow: 21, rainfall: 85, floodRisk: 'Medium' }] },
  { district: 'East Khasi Hills', state: 'Meghalaya', temperature: 20, rainfall: 165, humidity: 95, windSpeed: 25, condition: 'Heavy Rain', floodRisk: 'High', warning: 'Heavy rainfall warning. Expect 150-200mm in next 24 hours.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Heavy Rain', tempHigh: 21, tempLow: 16, rainfall: 180, floodRisk: 'High' }, { date: new Date(Date.now() + 172800000), condition: 'Storm', tempHigh: 19, tempLow: 15, rainfall: 200, floodRisk: 'Critical' }] },
  { district: 'Imphal West', state: 'Manipur', temperature: 25, rainfall: 78, humidity: 88, windSpeed: 18, condition: 'Heavy Rain', floodRisk: 'Medium', warning: 'Moderate rainfall expected to continue.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Cloudy', tempHigh: 26, tempLow: 19, rainfall: 45, floodRisk: 'Low' }] },
  { district: 'Aizawl', state: 'Mizoram', temperature: 22, rainfall: 145, humidity: 92, windSpeed: 30, condition: 'Storm', floodRisk: 'High', warning: 'Severe storm warning. Avoid travel on NH-6.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Heavy Rain', tempHigh: 23, tempLow: 17, rainfall: 120, floodRisk: 'High' }] },
  { district: 'Dimapur', state: 'Nagaland', temperature: 27, rainfall: 55, humidity: 80, windSpeed: 10, condition: 'Cloudy', floodRisk: 'Low', warning: '', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Light Rain', tempHigh: 28, tempLow: 21, rainfall: 40, floodRisk: 'Low' }] },
  { district: 'East Sikkim', state: 'Sikkim', temperature: 18, rainfall: 95, humidity: 90, windSpeed: 22, condition: 'Heavy Rain', floodRisk: 'Medium', warning: 'Landslide risk on NH-10. Use caution.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Heavy Rain', tempHigh: 19, tempLow: 13, rainfall: 110, floodRisk: 'High' }] },
  { district: 'West Tripura', state: 'Tripura', temperature: 30, rainfall: 15, humidity: 75, windSpeed: 8, condition: 'Cloudy', floodRisk: 'Low', warning: '', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Clear', tempHigh: 32, tempLow: 24, rainfall: 5, floodRisk: 'Low' }] },
  { district: 'West Garo Hills', state: 'Meghalaya', temperature: 24, rainfall: 130, humidity: 93, windSpeed: 20, condition: 'Heavy Rain', floodRisk: 'High', warning: 'Flash flood warning for low-lying areas.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Heavy Rain', tempHigh: 25, tempLow: 19, rainfall: 140, floodRisk: 'High' }] },
  { district: 'Tinsukia', state: 'Assam', temperature: 29, rainfall: 35, humidity: 78, windSpeed: 10, condition: 'Cloudy', floodRisk: 'Medium', warning: '', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Light Rain', tempHigh: 30, tempLow: 23, rainfall: 50, floodRisk: 'Medium' }] },
  { district: 'Kohima', state: 'Nagaland', temperature: 21, rainfall: 110, humidity: 91, windSpeed: 28, condition: 'Heavy Rain', floodRisk: 'High', warning: 'Road conditions deteriorating rapidly.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Storm', tempHigh: 20, tempLow: 14, rainfall: 150, floodRisk: 'Critical' }] },
  { district: 'Ri-Bhoi', state: 'Meghalaya', temperature: 22, rainfall: 100, humidity: 88, windSpeed: 15, condition: 'Heavy Rain', floodRisk: 'Medium', warning: 'Moderate flood risk in riverine areas.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Heavy Rain', tempHigh: 23, tempLow: 17, rainfall: 120, floodRisk: 'High' }] },
  { district: 'Sonitpur', state: 'Assam', temperature: 28, rainfall: 70, humidity: 85, windSpeed: 14, condition: 'Heavy Rain', floodRisk: 'High', warning: 'Brahmaputra water level above danger mark.', forecast: [{ date: new Date(Date.now() + 86400000), condition: 'Heavy Rain', tempHigh: 29, tempLow: 22, rainfall: 90, floodRisk: 'High' }] },
];

// Field Reports
const fieldReports = [
  { reportId: 'FR-0001', type: 'Landslide', description: 'Small landslide observed on village road near Nongstoin. Road partially blocked. One lane still passable for small vehicles.', location: { name: 'Near Nongstoin, West Khasi Hills', lat: 25.52, lng: 91.27 }, severity: 'Medium', reportedBy: { name: 'Officer Lyngdoh', phone: '9876543220' }, status: 'Reviewed' },
  { reportId: 'FR-0002', type: 'Road Damage', description: 'Multiple potholes and road surface erosion on district road near Champhai. Vehicles moving slowly.', location: { name: 'District Road, Champhai', lat: 24.32, lng: 93.32 }, severity: 'Medium', reportedBy: { name: 'Officer Lalremsiama', phone: '9876543221' }, status: 'Synced' },
  { reportId: 'FR-0003', type: 'Flood', description: 'Water logging on approach road to Majuli Island. River ferry service suspended due to high water levels.', location: { name: 'Majuli Approach Road', lat: 26.95, lng: 94.17 }, severity: 'High', reportedBy: { name: 'Officer Baruah', phone: '9876543222' }, status: 'Converted to Incident' },
];

// Users
const users = [
  { name: 'Admin User', email: 'admin@nerlogistics.gov.in', password: 'admin123', role: 'admin', phone: '9876543200', district: 'Kamrup Metropolitan' },
  { name: 'Dr. Rajendra Singh', email: 'official@nerlogistics.gov.in', password: 'official123', role: 'government_official', phone: '9876543201', district: 'Kamrup Metropolitan' },
  { name: 'Officer Marbaniang', email: 'field@nerlogistics.gov.in', password: 'field123', role: 'field_officer', phone: '9876543202', district: 'East Khasi Hills' },
  { name: 'Rajesh Kumar', email: 'driver@nerlogistics.gov.in', password: 'driver123', role: 'driver', phone: '9876543210', district: 'Kamrup Metropolitan' },
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      District.deleteMany({}),
      Road.deleteMany({}),
      Vehicle.deleteMany({}),
      Incident.deleteMany({}),
      Delivery.deleteMany({}),
      Alert.deleteMany({}),
      WeatherData.deleteMany({}),
      FieldReport.deleteMany({}),
      Route.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // Seed data
    console.log('🌱 Seeding users...');
    await User.create(users);

    console.log('🌱 Seeding districts...');
    await District.create(districts);

    console.log('🌱 Seeding roads...');
    await Road.create(roads);

    console.log('🌱 Seeding routes...');
    const defaultRoutes = [
      { routeId: 'RT-NH27-01', roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong Highway', origin: 'Guwahati', destination: 'Shillong', distance: '103 km', standardTime: '3h 30m', status: 'Open', riskLevel: 'Medium', disruptionProbability: 42 },
      { routeId: 'RT-NH37-01', roadId: 'NH-37-01', name: 'NH-37 Guwahati-Dimapur', origin: 'Guwahati', destination: 'Dimapur', distance: '320 km', standardTime: '8h 00m', status: 'Open', riskLevel: 'Low', disruptionProbability: 18 },
      { routeId: 'RT-NH02-MN', roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur Highway', origin: 'Imphal', destination: 'Dimapur', distance: '215 km', standardTime: '7h 00m', status: 'Risky', riskLevel: 'High', disruptionProbability: 78 },
      { routeId: 'RT-NH06-MZ', roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar Road', origin: 'Aizawl', destination: 'Silchar', distance: '180 km', standardTime: '6h 30m', status: 'Blocked', riskLevel: 'Critical', disruptionProbability: 95 },
      { routeId: 'RT-NH10-SK', roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri', origin: 'Gangtok', destination: 'Siliguri', distance: '114 km', standardTime: '4h 00m', status: 'Risky', riskLevel: 'High', disruptionProbability: 65 },
      { routeId: 'RT-NH39-NL', roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', origin: 'Kohima', destination: 'Imphal', distance: '137 km', standardTime: '5h 00m', status: 'Blocked', riskLevel: 'Critical', disruptionProbability: 92 },
      { routeId: 'RT-SH01-ML', roadId: 'SH-01-ML', name: 'SH-01 Shillong-Dawki Road', origin: 'Shillong', destination: 'Dawki', distance: '82 km', standardTime: '3h 00m', status: 'Open', riskLevel: 'Medium', disruptionProbability: 35 },
      { routeId: 'RT-SH02-TR', roadId: 'SH-02-TR', name: 'SH-02 Agartala-Udaipur Road', origin: 'Agartala', destination: 'Udaipur', distance: '55 km', standardTime: '1h 30m', status: 'Open', riskLevel: 'Low', disruptionProbability: 12 }
    ];
    await Route.create(defaultRoutes);

    console.log('🌱 Seeding vehicles...');
    await Vehicle.create(vehicles);

    console.log('🌱 Seeding incidents...');
    await Incident.create(incidents);

    console.log('🌱 Seeding deliveries...');
    await Delivery.create(deliveries);

    console.log('🌱 Seeding alerts...');
    await Alert.create(alerts);

    console.log('🌱 Seeding weather data...');
    await WeatherData.create(weatherData);

    console.log('🌱 Seeding field reports...');
    await FieldReport.create(fieldReports);

    console.log('\n✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Districts: ${districts.length}`);
    console.log(`   Roads: ${roads.length}`);
    console.log(`   Routes: ${defaultRoutes.length}`);
    console.log(`   Vehicles: ${vehicles.length}`);
    console.log(`   Incidents: ${incidents.length}`);
    console.log(`   Deliveries: ${deliveries.length}`);
    console.log(`   Alerts: ${alerts.length}`);
    console.log(`   Weather Records: ${weatherData.length}`);
    console.log(`   Field Reports: ${fieldReports.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@nerlogistics.gov.in / admin123');
    console.log('   Official: official@nerlogistics.gov.in / official123');
    console.log('   Field: field@nerlogistics.gov.in / field123');
    console.log('   Driver: driver@nerlogistics.gov.in / driver123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
