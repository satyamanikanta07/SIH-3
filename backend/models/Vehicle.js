const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  type: { type: String, enum: ['Truck', 'Van', 'Ambulance', 'Pickup', 'Tanker'], default: 'Truck' },
  driver: {
    name: { type: String, required: true },
    phone: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
    updatedAt: { type: Date, default: Date.now }
  },
  origin: { name: String, lat: Number, lng: Number },
  destination: { name: String, lat: Number, lng: Number },
  cargo: { type: String, enum: ['Medicines', 'Food', 'Agricultural', 'Construction', 'Emergency', 'Fuel', 'General'], required: true },
  cargoPriority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Moving', 'Stopped', 'Delayed', 'At Risk', 'Delivered', 'Maintenance'], default: 'Moving' },
  currentSpeed: { type: Number, default: 0 }, // km/h
  eta: { type: Date },
  currentRoute: { type: String },
  fuelLevel: { type: Number, min: 0, max: 100, default: 100 },
  distanceCovered: { type: Number, default: 0 }, // km
  totalDistance: { type: Number, default: 0 }, // km
  isActive: { type: Boolean, default: true },
  lastPing: { type: Date, default: Date.now },
  locationHistory: [{
    lat: Number, lng: Number, timestamp: Date, speed: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
