const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryId: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  cargo: { type: String, enum: ['Medicines', 'Food', 'Agricultural', 'Construction', 'Emergency', 'Fuel', 'General', 'Other'], required: true },
  cargoDescription: String,
  origin: { name: String, district: String, lat: Number, lng: Number },
  destination: { name: String, district: String, lat: Number, lng: Number },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Delayed', 'At Risk', 'Cancelled'], default: 'Pending' },
  eta: { type: Date },
  actualDelivery: { type: Date },
  delay: { type: Number, default: 0 }, // minutes
  route: { type: String },
  alternateRoute: { type: String },
  weight: { type: Number }, // kg
  driver: {
    name: String,
    phone: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  receiver: { name: String, phone: String },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
