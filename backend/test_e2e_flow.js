const mongoose = require('mongoose');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./server');
const Road = require('./models/Road');
const Delivery = require('./models/Delivery');
const Alert = require('./models/Alert');
const Incident = require('./models/Incident');
const FieldReport = require('./models/FieldReport');
const User = require('./models/User');

const weatherService = require('./services/weatherService');
const transportService = require('./services/transportService');
const governmentDataService = require('./services/governmentDataService');

const JWT_SECRET = process.env.JWT_SECRET || 'ner_logistics_secret_key_2025';

function createToken(role, name, id = new mongoose.Types.ObjectId()) {
  return jwt.sign({ id: id.toString(), name, role, email: `${role}@nerlogistics.gov.in` }, JWT_SECRET, { expiresIn: '1h' });
}

function req(server, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    r.on('error', reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

async function runE2E() {
  console.log('============================================================');
  console.log('🚀 NER SMART LOGISTICS: END-TO-END DISASTER SCENARIO VERIFICATION');
  console.log('============================================================');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Server listening on port ${port}`);

  const adminToken = createToken('admin', 'E2E Admin');
  const govtToken = createToken('government_official', 'E2E Govt Official');
  const fieldToken = createToken('field_officer', 'E2E Field Officer');
  const driverToken = createToken('driver', 'Rajesh Kumar');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // PHASE 1: External Integration Services
    // -------------------------------------------------------------
    console.log('\n--- PHASE 1: External Integration Architecture ---');
    const weather = await weatherService.getDistrictWeather('East Khasi Hills');
    assert(weather && weather.district === 'East Khasi Hills', 'Weather service retrieves live/cached weather for East Khasi Hills');

    const vahan = await transportService.verifyVehicleRegistration('AS-01-GC-4421');
    assert(vahan && vahan.registrationNumber === 'AS-01-GC-4421', 'Transport service returns VAHAN commercial vehicle telematics');

    const alerts = await governmentDataService.fetchDisasterAdvisories();
    assert(Array.isArray(alerts) && alerts.length > 0, 'Government disaster data service returns active NDMA/SDMA advisories');

    // -------------------------------------------------------------
    // PHASE 2: Road Blockage & Automated Cascading Actions
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2: Road Blockage Cascades (Auto-Alert & Delivery Protection) ---');

    // Setup delivery on NH-02-MN
    await Delivery.deleteMany({ deliveryId: 'DEL-E2E-TEST' });
    const testDelivery = new Delivery({
      deliveryId: 'DEL-E2E-TEST',
      vehicleId: 'NER-101',
      cargo: 'Medicines',
      origin: { name: 'Guwahati Warehouse', district: 'Kamrup Metropolitan' },
      destination: { name: 'Imphal Civil Hospital', district: 'Imphal West' },
      status: 'In Transit',
      priority: 'Critical',
      route: 'NH-02-MN'
    });
    await testDelivery.save();

    // Block the road via Admin
    const blockRes = await req(server, 'PUT', '/api/roads/NH-02-MN', { Authorization: `Bearer ${adminToken}` }, {
      status: 'Blocked',
      reason: 'Major landslide at Km 42-45'
    });
    assert(blockRes.status === 200 && blockRes.body.data.status === 'Blocked', 'Admin successfully blocks road NH-02-MN');

    // Verify auto-alert creation
    const autoAlert = await Alert.findOne({ 'location.name': /NH-02-MN|NH-2/, severity: 'Critical' }).sort({ createdAt: -1 });
    assert(autoAlert && autoAlert.severity === 'Critical', 'Automated critical alert generated dynamically for road blockage');

    // Verify test delivery transitioned to At Risk
    const updatedDelivery = await Delivery.findOne({ deliveryId: 'DEL-E2E-TEST' });
    assert(updatedDelivery && updatedDelivery.status === 'At Risk', 'Active delivery on blocked corridor marked At Risk automatically');

    // -------------------------------------------------------------
    // PHASE 3: AI Alternate Route Selection & Acceptance
    // -------------------------------------------------------------
    console.log('\n--- PHASE 3: AI Reroute Selection & Driver Acceptance ---');
    const rerouteRes = await req(server, 'PUT', '/api/routes/NH-02-MN/reroute', { Authorization: `Bearer ${govtToken}` }, {
      selectedAlternative: {
        name: 'Via NH-37 & Dimapur Bypass',
        distance: 285,
        estimatedTime: '6h 15m',
        delayMinutes: 45,
        reason: 'Avoids landslide hazard zone with all-weather pavement'
      }
    });
    assert(rerouteRes.status === 200, 'Govt Official selects AI alternative corridor');

    const acceptRes = await req(server, 'PUT', '/api/routes/NH-02-MN/accept-reroute', { Authorization: `Bearer ${driverToken}` }, {});
    assert(acceptRes.status === 200, 'Driver accepts alternate route for vehicle NER-101');

    // -------------------------------------------------------------
    // PHASE 4: Ground Intelligence Field Report Sync & Promotion
    // -------------------------------------------------------------
    console.log('\n--- PHASE 4: Field Report Sync & Official Incident Promotion ---');
    const syncRes = await req(server, 'POST', '/api/field-reports/sync', { Authorization: `Bearer ${fieldToken}` }, {
      reports: [{
        reportId: 'FR-E2E-001',
        type: 'Landslide',
        severity: 'Critical',
        description: 'Large rockfall covering both carriageways. PWD clearing team arriving.',
        location: { name: 'NH-2 Kangpokpi section', lat: 24.8170, lng: 93.9368, district: 'Imphal West' },
        photograph: '/uploads/sample_landslide.jpg'
      }]
    });
    assert(syncRes.status === 201 && syncRes.body.count === 1, 'Field Officer batch syncs offline field report to MongoDB');

    const convertRes = await req(server, 'PUT', '/api/field-reports/FR-E2E-001/convert', { Authorization: `Bearer ${adminToken}` }, {});
    assert(convertRes.status === 200 && convertRes.body.data.incident, 'Admin converts field report into an Official Live Incident');
    const incidentId = convertRes.body.data.incident.incidentId;

    // -------------------------------------------------------------
    // PHASE 5: Incident Resolution & Corridor Reopening
    // -------------------------------------------------------------
    console.log('\n--- PHASE 5: Incident Resolution & Corridor Reopening ---');
    const resolveRes = await req(server, 'PUT', `/api/incidents/${incidentId}`, { Authorization: `Bearer ${adminToken}` }, {
      status: 'Resolved'
    });
    assert(resolveRes.status === 200 && resolveRes.body.data.status === 'Resolved', 'Admin resolves official incident');

    const reopenRes = await req(server, 'PUT', '/api/roads/NH-02-MN', { Authorization: `Bearer ${adminToken}` }, {
      status: 'Open',
      reason: 'Debris completely cleared by PWD engineering team'
    });
    assert(reopenRes.status === 200 && reopenRes.body.data.status === 'Open', 'Admin reopens corridor NH-02-MN');

    // Verify auto-alert is resolved
    const resolvedAlert = await Alert.findOne({ _id: autoAlert._id });
    assert(resolvedAlert && resolvedAlert.isRead === true, 'Corridor blockage alert marked resolved/read on corridor reopen');

    // -------------------------------------------------------------
    // PHASE 6: Dynamic Analytics & Bottlenecks Verification
    // -------------------------------------------------------------
    console.log('\n--- PHASE 6: Dynamic Intelligence Analytics ---');
    const insightsRes = await req(server, 'GET', '/api/analytics/insights', { Authorization: `Bearer ${adminToken}` });
    assert(insightsRes.status === 200 && insightsRes.body.data.length > 0, 'Dynamic AI insights endpoint returns active intelligence');

    const bottlenecksRes = await req(server, 'GET', '/api/analytics/bottlenecks', { Authorization: `Bearer ${adminToken}` });
    assert(bottlenecksRes.status === 200 && bottlenecksRes.body.data.highRiskDistricts, 'Logistics bottlenecks endpoint returns high-risk districts & cargo metrics');

    // Clean up test data
    await Delivery.deleteMany({ deliveryId: 'DEL-E2E-TEST' });
    await FieldReport.deleteMany({ reportId: 'FR-E2E-001' });
    if (incidentId) await Incident.deleteMany({ incidentId });

  } catch (err) {
    console.error('Test run encountered error:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n============================================================');
    console.log(`📊 E2E SUITE SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log('============================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runE2E();
