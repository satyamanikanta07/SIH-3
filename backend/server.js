const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ner_logistics')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/roads', require('./routes/roads'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/field-reports', require('./routes/fieldReports'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NER Logistics Backend', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 NER Logistics Backend running on port ${PORT}`);
  });
}

module.exports = app;
