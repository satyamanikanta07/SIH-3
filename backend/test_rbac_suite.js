const http = require('http');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = require('./server');

const JWT_SECRET = process.env.JWT_SECRET || 'ner_logistics_secret_key_2024';

// Generate valid JWT tokens for each role
const createToken = (id, name, email, role) => {
  return jwt.sign({ userId: id, id, name, email, role }, JWT_SECRET, { expiresIn: '1h' });
};

const tokens = {
  admin: createToken('650000000000000000000001', 'Admin User', 'admin@nerlogistics.gov.in', 'admin'),
  govt: createToken('650000000000000000000002', 'Govt Official', 'official@nerlogistics.gov.in', 'government_official'),
  field: createToken('650000000000000000000003', 'Field Officer', 'field@nerlogistics.gov.in', 'field_officer'),
  driver: createToken('650000000000000000000004', 'Rajesh Kumar', 'driver@nerlogistics.gov.in', 'driver')
};

async function runTestSuite() {
  // Start server on free ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  // Ensure DB connection is open
  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => mongoose.connection.once('open', resolve));
  }

  const client = (token) => axios.create({
    baseURL: baseUrl,
    validateStatus: () => true, // Don't throw on 4xx/5xx so we can assert exact status codes
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const uid = Date.now().toString().slice(-4);
  const testDelId = `DEL-T${uid}`;
  const testIncId = `INC-T${uid}`;
  const testRepId = `FR-T${uid}`;

  console.log('\n============================================================');
  console.log('🧪 NER SMART LOGISTICS: COMPREHENSIVE RBAC & FUNCTIONAL TEST SUITE');
  console.log(`Target Ephemeral Port: ${port} | Test Run ID: ${uid}`);
  console.log('============================================================\n');

  try {
    // -------------------------------------------------------------
    console.log('🔹 TEST 1: Road Status Modification Permissions');
    // -------------------------------------------------------------
    // Admin can update road
    let res = await client(tokens.admin).put('/roads/NH-02-MN', { status: 'Blocked', reason: 'Landslide' });
    assert(res.status === 200 && res.data.success, 'Admin updates road status to Blocked (200 OK)');

    // Govt Official can update road
    res = await client(tokens.govt).put('/roads/NH-02-MN', { status: 'Risky', reason: 'Waterlogging' });
    assert(res.status === 200 && res.data.success, 'Govt Official updates road status (200 OK)');

    // Driver CANNOT update road
    res = await client(tokens.driver).put('/roads/NH-02-MN', { status: 'Open' });
    assert(res.status === 403, 'Driver attempting to update road status blocked (403 Forbidden)');

    // Field Officer CANNOT update road
    res = await client(tokens.field).put('/roads/NH-02-MN', { status: 'Open' });
    assert(res.status === 403, 'Field Officer attempting to update road status blocked (403 Forbidden)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 2: Delivery CRUD & Driver Scoping');
    // -------------------------------------------------------------
    // Admin creates delivery
    const delPayload = {
      deliveryId: testDelId,
      vehicleId: 'NER-101',
      cargo: 'Medicines',
      cargoDescription: 'Emergency Vaccines',
      priority: 'Critical',
      driver: { name: 'Rajesh Kumar', phone: '9876543210' },
      origin: { name: 'Guwahati Medical' },
      destination: { name: 'Shillong Civil' },
      status: 'In Transit'
    };
    res = await client(tokens.admin).post('/deliveries', delPayload);
    assert((res.status === 200 || res.status === 201) && res.data.success, 'Admin dispatches delivery (200/201 OK)');

    // Driver views assigned deliveries
    res = await client(tokens.driver).get('/deliveries/my-deliveries');
    assert(res.status === 200 && res.data.success, 'Driver retrieves assigned deliveries (200 OK)');

    // Driver CANNOT create delivery
    res = await client(tokens.driver).post('/deliveries', delPayload);
    assert(res.status === 403, 'Driver attempting to create delivery blocked (403 Forbidden)');

    // Govt Official CANNOT create delivery (Admin only)
    res = await client(tokens.govt).post('/deliveries', delPayload);
    assert(res.status === 403, 'Govt Official attempting to create delivery blocked (403 Forbidden)');

    // Field Officer CANNOT create delivery
    res = await client(tokens.field).post('/deliveries', delPayload);
    assert(res.status === 403, 'Field Officer attempting to create delivery blocked (403 Forbidden)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 3: Alert Broadcast Authorization');
    // -------------------------------------------------------------
    const alertPayload = {
      title: `NH-2 Landslide Alert ${uid}`,
      severity: 'Critical',
      type: 'Road Blockage',
      message: 'NH-2 blocked. Use alternate route.'
    };
    // Admin broadcasts alert
    res = await client(tokens.admin).post('/alerts', alertPayload);
    assert((res.status === 200 || res.status === 201) && res.data.success, 'Admin broadcasts emergency alert (200/201 OK)');

    // Driver can read alerts
    res = await client(tokens.driver).get('/alerts');
    assert(res.status === 200 && res.data.success, 'Driver accesses alerts feed (200 OK)');

    // Driver CANNOT broadcast alert
    res = await client(tokens.driver).post('/alerts', alertPayload);
    assert(res.status === 403, 'Driver attempting to broadcast alert blocked (403 Forbidden)');

    // Field Officer CANNOT broadcast alert
    res = await client(tokens.field).post('/alerts', alertPayload);
    assert(res.status === 403, 'Field Officer attempting to broadcast alert blocked (403 Forbidden)');

    // Govt Official CANNOT broadcast alert (Admin only)
    res = await client(tokens.govt).post('/alerts', alertPayload);
    assert(res.status === 403, 'Govt Official attempting to broadcast alert blocked (403 Forbidden)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 4: Incident Lifecycle & Admin-Only Resolution');
    // -------------------------------------------------------------
    // Field officer creates incident
    const incPayload = {
      incidentId: testIncId,
      type: 'Landslide',
      severity: 'Critical',
      description: 'Major rockfall on NH-2',
      location: { name: 'NH-2 near Kangpokpi', district: 'Imphal West', coordinates: { lat: 24.81, lng: 93.93 } }
    };
    res = await client(tokens.field).post('/incidents', incPayload);
    assert((res.status === 200 || res.status === 201) && res.data.success, 'Field Officer reports new incident (200/201 OK)');

    // Govt Official confirms incident
    res = await client(tokens.govt).put(`/incidents/${testIncId}`, { status: 'Confirmed' });
    assert(res.status === 200 && res.data.success, 'Govt Official confirms incident (200 OK)');

    // Govt Official ATTEMPTS to Resolve incident -> MUST BE 403 FORBIDDEN!
    res = await client(tokens.govt).put(`/incidents/${testIncId}`, { status: 'Resolved' });
    assert(res.status === 403, 'Govt Official attempting to Resolve incident blocked (403 Forbidden)');

    // Field Officer ATTEMPTS to Resolve incident -> MUST BE 403 FORBIDDEN!
    res = await client(tokens.field).put(`/incidents/${testIncId}`, { status: 'Resolved' });
    assert(res.status === 403, 'Field Officer attempting to Resolve incident blocked (403 Forbidden)');

    // Admin Resolves incident -> Allowed
    res = await client(tokens.admin).put(`/incidents/${testIncId}`, { status: 'Resolved' });
    assert(res.status === 200 && res.data.success, 'Admin resolves incident successfully (200 OK)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 5: Alternate Route Intelligence & Driver Acceptance');
    // -------------------------------------------------------------
    const reroutePayload = {
      alternativeName: 'NH-44 Bypass',
      extraTime: '+42 minutes',
      distance: '242 km',
      risk: 'Low'
    };
    // Govt Official approves bypass reroute
    res = await client(tokens.govt).put('/routes/NH-02-MN/reroute', reroutePayload);
    assert(res.status === 200 && res.data.success, 'Govt Official selects alternative bypass route (200 OK)');

    // Driver accepts reroute
    res = await client(tokens.driver).put('/routes/NH-02-MN/accept-reroute');
    assert(res.status === 200 && res.data.success, 'Driver accepts reroute (200 OK)');

    // Driver CANNOT set official route reroute
    res = await client(tokens.driver).put('/routes/NH-02-MN/reroute', reroutePayload);
    assert(res.status === 403, 'Driver attempting to select official bypass blocked (403 Forbidden)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 6: Vehicle Telemetry Scoping');
    // -------------------------------------------------------------
    // Driver updates their assigned vehicle (NER-101)
    res = await client(tokens.driver).put('/vehicles/NER-101/location', { speed: 45, fuelLevel: 62, lat: 25.5788, lng: 91.8933 });
    assert(res.status === 200 && res.data.success, 'Driver updates assigned vehicle telemetry: speed=45km/h, fuel=62% (200 OK)');

    // Driver ATTEMPTS to update someone else\'s vehicle (NER-105) -> MUST BE 403 FORBIDDEN!
    res = await client(tokens.driver).put('/vehicles/NER-105/location', { speed: 10, fuelLevel: 10 });
    assert(res.status === 403, 'Driver attempting to update unassigned vehicle blocked (403 Forbidden)');

    // Admin updates any vehicle
    res = await client(tokens.admin).put('/vehicles/NER-105/location', { speed: 30, fuelLevel: 80 });
    assert(res.status === 200 && res.data.success, 'Admin updates vehicle telemetry (200 OK)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 7: Field Report Creation, Sync & Conversion');
    // -------------------------------------------------------------
    const fieldReport = {
      reportId: testRepId,
      type: 'Landslide',
      severity: 'High',
      description: 'Debris covering 50m of road',
      location: { name: 'NH-2 near Kangpokpi', lat: 24.81, lng: 93.93 }
    };
    // Field officer creates field report
    res = await client(tokens.field).post('/field-reports', fieldReport);
    assert((res.status === 200 || res.status === 201) && res.data.success, 'Field Officer submits field report (200/201 OK)');

    // Field officer syncs batch
    res = await client(tokens.field).post('/field-reports/sync', { reports: [fieldReport] });
    assert((res.status === 200 || res.status === 201) && res.data.success, 'Field Officer batch syncs offline reports (200/201 OK)');

    // Driver CANNOT submit field reports
    res = await client(tokens.driver).post('/field-reports', fieldReport);
    assert(res.status === 403, 'Driver attempting to submit field report blocked (403 Forbidden)');

    // Govt Official converts field report to incident
    res = await client(tokens.govt).put(`/field-reports/${testRepId}/convert`);
    assert(res.status === 200 && res.data.success, 'Govt Official converts field report to official incident (200 OK)');

    // -------------------------------------------------------------
    console.log('\n🔹 TEST 8: Full RBAC Endpoint Access Matrix');
    // -------------------------------------------------------------
    // Analytics overview accessible to all authenticated
    res = await client(tokens.driver).get('/analytics/overview');
    assert(res.status === 200 && res.data.success, 'Driver can view high-level analytics overview (200 OK)');

    // Detailed analytics restricted to admin and government_official
    res = await client(tokens.driver).get('/analytics/incidents-by-type');
    assert(res.status === 403, 'Driver blocked from deep analytical breakdowns (403 Forbidden)');

    res = await client(tokens.field).get('/analytics/incidents-by-type');
    assert(res.status === 403, 'Field Officer blocked from deep analytical breakdowns (403 Forbidden)');

    res = await client(tokens.govt).get('/analytics/incidents-by-type');
    assert(res.status === 200 && res.data.success, 'Govt Official accesses deep analytical breakdowns (200 OK)');

    // Audit logs restricted to admin and government_official
    res = await client(tokens.driver).get('/audit-logs');
    assert(res.status === 403, 'Driver blocked from system audit logs (403 Forbidden)');

    res = await client(tokens.field).get('/audit-logs');
    assert(res.status === 403, 'Field Officer blocked from system audit logs (403 Forbidden)');

    res = await client(tokens.admin).get('/audit-logs');
    assert(res.status === 200 && res.data.success, 'Admin retrieves system audit logs (200 OK)');

  } catch (error) {
    console.error('Unhandled test suite error:', error);
    failed++;
  } finally {
    server.close();
    console.log('\n============================================================');
    console.log(`📊 TEST SUITE SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log('============================================================\n');
    process.exit(failed === 0 ? 0 : 1);
  }
}

runTestSuite();
