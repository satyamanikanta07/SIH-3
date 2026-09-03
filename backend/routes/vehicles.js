const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Get all vehicles with filters
router.get('/', async (req, res) => {
  try {
    const { status, cargo, cargoPriority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (cargo) filter.cargo = cargo;
    if (cargoPriority) filter.cargoPriority = cargoPriority;
    const vehicles = await Vehicle.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assigned vehicle for logged-in driver
router.get('/my-vehicle', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      $or: [
        { 'driver.userId': req.user._id },
        { 'driver.name': req.user.name },
        { 'driver.name': new RegExp(req.user.name, 'i') }
      ]
    });
    if (!vehicle) {
      // Fallback: return default driver vehicle NER-101
      const fallback = await Vehicle.findOne({ vehicleId: 'NER-101' });
      return res.json({ success: true, data: fallback });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const query = { $or: [{ vehicleId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }
    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update vehicle telemetry (GPS, speed, fuel)
// Admin and Govt can update any; Driver can ONLY update their assigned vehicle!
router.put('/:id/location', auth, async (req, res) => {
  try {
    const query = { $or: [{ vehicleId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // RBAC: Drivers can ONLY update their own assigned vehicle!
    if (req.user.role === 'driver') {
      const isAssigned =
        (vehicle.driver?.userId && vehicle.driver.userId.toString() === req.user._id.toString()) ||
        (vehicle.driver?.name && vehicle.driver.name.toLowerCase() === req.user.name.toLowerCase()) ||
        vehicle.vehicleId === 'NER-101'; // Default assigned vehicle for demo driver

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Drivers can only update their assigned vehicle.'
        });
      }
    } else if (!['admin', 'government_official'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions to update telemetry.'
      });
    }

    const { lat, lng, speed, fuelLevel, address, status } = req.body;
    const updateFields = {
      lastPing: new Date()
    };

    if (lat !== undefined && lng !== undefined) {
      updateFields.currentLocation = {
        lat: Number(lat),
        lng: Number(lng),
        address: address || vehicle.currentLocation?.address,
        updatedAt: new Date()
      };
      updateFields.$push = {
        locationHistory: { lat: Number(lat), lng: Number(lng), timestamp: new Date(), speed: Number(speed || vehicle.currentSpeed) }
      };
    }

    if (speed !== undefined) updateFields.currentSpeed = Number(speed);
    if (fuelLevel !== undefined) updateFields.fuelLevel = Number(fuelLevel);
    if (status !== undefined) updateFields.status = status;

    const updated = await Vehicle.findOneAndUpdate(query, updateFields, { new: true });

    await logAudit(req, 'TELEMETRY_UPDATED', 'Vehicle', updated.vehicleId, {
      speed: updated.currentSpeed,
      fuelLevel: updated.fuelLevel,
      lat: updated.currentLocation?.lat,
      lng: updated.currentLocation?.lng
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vehicle stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Vehicle.countDocuments({ isActive: true });
    const moving = await Vehicle.countDocuments({ status: 'Moving' });
    const stopped = await Vehicle.countDocuments({ status: 'Stopped' });
    const delayed = await Vehicle.countDocuments({ status: 'Delayed' });
    const atRisk = await Vehicle.countDocuments({ status: 'At Risk' });
    res.json({ success: true, data: { total, moving, stopped, delayed, atRisk } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
