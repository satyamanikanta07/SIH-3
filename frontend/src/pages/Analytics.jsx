import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = ['#059669', '#d97706', '#dc2626', '#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

const roadStatusData = [
  { name: 'Open', value: 2120, fill: '#059669' },
  { name: 'Risky', value: 187, fill: '#d97706' },
  { name: 'Blocked', value: 124, fill: '#dc2626' },
];

const incidentTypeData = [
  { name: 'Landslide', count: 15 },
  { name: 'Flood', count: 10 },
  { name: 'Road Damage', count: 8 },
  { name: 'Weather', count: 7 },
  { name: 'Bridge', count: 4 },
  { name: 'Accident', count: 3 },
  { name: 'Traffic', count: 2 },
];

const deliveryStatusData = [
  { name: 'In Transit', value: 87, fill: '#2563eb' },
  { name: 'Delivered', value: 45, fill: '#059669' },
  { name: 'Delayed', value: 18, fill: '#d97706' },
  { name: 'At Risk', value: 4, fill: '#dc2626' },
  { name: 'Pending', value: 2, fill: '#94a3b8' },
];

const districtData = [
  { name: 'Kamrup Metro', accessibility: 92, roads: 340, incidents: 2 },
  { name: 'Sonitpur', accessibility: 80, roads: 260, incidents: 3 },
  { name: 'West Tripura', accessibility: 78, roads: 195, incidents: 1 },
  { name: 'Tinsukia', accessibility: 75, roads: 220, incidents: 2 },
  { name: 'E. Khasi Hills', accessibility: 72, roads: 210, incidents: 5 },
  { name: 'Dimapur', accessibility: 70, roads: 175, incidents: 4 },
  { name: 'Imphal West', accessibility: 68, roads: 185, incidents: 3 },
  { name: 'Ri-Bhoi', accessibility: 66, roads: 155, incidents: 2 },
  { name: 'Aizawl', accessibility: 65, roads: 160, incidents: 6 },
  { name: 'E. Sikkim', accessibility: 60, roads: 140, incidents: 4 },
  { name: 'Kohima', accessibility: 58, roads: 145, incidents: 7 },
  { name: 'W. Garo Hills', accessibility: 55, roads: 130, incidents: 5 },
];

const trendData = [
  { month: 'Mar', disruptions: 12, resolved: 10 },
  { month: 'Apr', disruptions: 18, resolved: 15 },
  { month: 'May', disruptions: 25, resolved: 20 },
  { month: 'Jun', disruptions: 35, resolved: 28 },
  { month: 'Jul', disruptions: 48, resolved: 35 },
  { month: 'Aug', disruptions: 42, resolved: 38 },
  { month: 'Sep', disruptions: 38, resolved: 32 },
];

const vehiclePerfData = [
  { name: 'Medicines', avgDelay: 35, trips: 28 },
  { name: 'Food', avgDelay: 48, trips: 22 },
  { name: 'Emergency', avgDelay: 12, trips: 15 },
  { name: 'Construction', avgDelay: 65, trips: 18 },
  { name: 'Agricultural', avgDelay: 25, trips: 20 },
  { name: 'Fuel', avgDelay: 55, trips: 12 },
];

export default function Analytics() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>Comprehensive analytics for NER logistics operations</p>
        </div>
      </div>

      {/* Row 1: Road Status + Incidents by Type */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>📊 Road Accessibility</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roadStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roadStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>⚠️ Incidents by Type</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incidentTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Delivery Status + District Connectivity */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>📦 Delivery Status</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deliveryStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {deliveryStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🏘️ District Accessibility Scores</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="accessibility" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {districtData.map((entry, i) => (
                    <Cell key={i} fill={entry.accessibility >= 75 ? '#059669' : entry.accessibility >= 60 ? '#d97706' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Disruption Trends + Vehicle Performance */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>📈 Disruption Trends</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="disruptions" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🚛 Avg Delay by Cargo Type</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vehiclePerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgDelay" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Delay (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
