const router = require('express').Router();
const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Get all deliveries with filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, cargo, district, vehicleId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (cargo) filter.cargo = cargo;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (district) {
      filter.$or = [{ 'origin.district': district }, { 'destination.district': district }];
    }
    const deliveries = await Delivery.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get deliveries assigned to logged-in driver
router.get('/my-deliveries', auth, async (req, res) => {
  try {
    // Find vehicle assigned to this driver
    const assignedVehicle = await Vehicle.findOne({
      $or: [
        { 'driver.userId': req.user._id },
        { 'driver.name': req.user.name },
        { 'driver.name': new RegExp(req.user.name, 'i') }
      ]
    });

    const query = {
      $or: [
        { 'driver.userId': req.user._id },
        { 'driver.name': req.user.name },
        { 'driver.name': new RegExp(req.user.name, 'i') }
      ]
    };

    if (assignedVehicle) {
      query.$or.push({ vehicleId: assignedVehicle.vehicleId });
    }

    const deliveries = await Delivery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const query = { $or: [{ deliveryId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }
    const delivery = await Delivery.findOne(query);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create delivery (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const count = await Delivery.countDocuments();
    const deliveryId = req.body.deliveryId || `DEL-${String(count + 1).padStart(4, '0')}`;

    const delivery = new Delivery({
      ...req.body,
      deliveryId
    });
    await delivery.save();

    await logAudit(req, 'DELIVERY_CREATED', 'Delivery', delivery.deliveryId, {
      cargo: delivery.cargo,
      priority: delivery.priority,
      vehicleId: delivery.vehicleId,
      destination: delivery.destination?.name
    });

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update delivery / priority / reassignment (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const query = { $or: [{ deliveryId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const delivery = await Delivery.findOneAndUpdate(query, req.body, { new: true });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });

    await logAudit(req, 'DELIVERY_UPDATED', 'Delivery', delivery.deliveryId, {
      updatedFields: Object.keys(req.body),
      priority: delivery.priority,
      status: delivery.status,
      vehicleId: delivery.vehicleId
    });

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete / Cancel delivery (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const query = { $or: [{ deliveryId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const delivery = await Delivery.findOneAndDelete(query);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });

    await logAudit(req, 'DELIVERY_DELETED', 'Delivery', delivery.deliveryId, {
      cargo: delivery.cargo,
      destination: delivery.destination?.name
    });

    res.json({ success: true, message: 'Delivery deleted successfully', data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
