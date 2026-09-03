import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiMap, FiTruck, FiNavigation, FiAlertTriangle, FiBell, FiPackage, FiBarChart2, FiFileText, FiSettings, FiSearch, FiMenu, FiX, FiLogOut, FiPlay } from 'react-icons/fi';

const navItems = [
  { path: '/', icon: FiGrid, label: 'Dashboard' },
  { path: '/map', icon: FiMap, label: 'Live Map' },
  { path: '/vehicles', icon: FiTruck, label: 'Vehicles' },
  { path: '/routes', icon: FiNavigation, label: 'Routes' },
  { path: '/incidents', icon: FiAlertTriangle, label: 'Incidents' },
  { path: '/alerts', icon: FiBell, label: 'Alerts' },
  { path: '/logistics', icon: FiPackage, label: 'Logistics' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { path: '/field-reports', icon: FiFileText, label: 'Field Reports' },
  { path: '/simulation', icon: FiPlay, label: 'Live Simulation' },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
];

const pageTitles = {
  '/': 'Dashboard',
  '/map': 'Live Map',
  '/vehicles': 'Vehicle Tracking',
  '/routes': 'Route Management',
  '/incidents': 'Incident Management',
  '/alerts': 'Alerts & Notifications',
  '/logistics': 'Logistics Management',
  '/analytics': 'Analytics',
  '/field-reports': 'Field Reports',
  '/simulation': 'Disaster & Logistics Simulation',
  '/settings': 'Settings',
};

export default function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const role = user?.role || 'admin';

  // Role-based navigation filtering
  let roleNavItems = [];
  if (role === 'driver') {
    roleNavItems = [
      { section: 'Main Menu', items: [
        { path: '/', icon: FiGrid, label: 'Dashboard' },
        { path: '/map', icon: FiMap, label: 'Live Map' },
      ]},
      { section: 'My Assignment', items: [
        { path: '/vehicles', icon: FiTruck, label: 'My Vehicle' },
        { path: '/routes', icon: FiNavigation, label: 'My Route' },
        { path: '/logistics', icon: FiPackage, label: 'My Deliveries' },
        { path: '/alerts', icon: FiBell, label: 'Alerts' },
      ]},
      { section: 'System', items: [
        { path: '/settings', icon: FiSettings, label: 'Settings' },
      ]}
    ];
  } else if (role === 'field_officer') {
    roleNavItems = [
      { section: 'Main Menu', items: [
        { path: '/', icon: FiGrid, label: 'Dashboard' },
        { path: '/map', icon: FiMap, label: 'Live Map' },
        { path: '/field-reports', icon: FiFileText, label: 'Field Reports' },
      ]},
      { section: 'Operations', items: [
        { path: '/incidents', icon: FiAlertTriangle, label: 'Incidents' },
        { path: '/alerts', icon: FiBell, label: 'Alerts' },
      ]},
      { section: 'System', items: [
        { path: '/simulation', icon: FiPlay, label: 'Live Simulation' },
        { path: '/settings', icon: FiSettings, label: 'Settings' },
      ]}
    ];
  } else if (role === 'government_official') {
    roleNavItems = [
      { section: 'Main Menu', items: [
        { path: '/', icon: FiGrid, label: 'Dashboard' },
        { path: '/map', icon: FiMap, label: 'Live Map' },
        { path: '/vehicles', icon: FiTruck, label: 'Vehicles' },
        { path: '/routes', icon: FiNavigation, label: 'Routes' },
      ]},
      { section: 'Operations', items: [
        { path: '/incidents', icon: FiAlertTriangle, label: 'Incidents' },
        { path: '/alerts', icon: FiBell, label: 'Alerts' },
        { path: '/logistics', icon: FiPackage, label: 'Logistics' },
        { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
      ]},
      { section: 'System', items: [
        { path: '/simulation', icon: FiPlay, label: 'Live Simulation' },
        { path: '/settings', icon: FiSettings, label: 'Settings' },
      ]}
    ];
  } else {
    // Admin has full access
    roleNavItems = [
      { section: 'Main Menu', items: [
        { path: '/', icon: FiGrid, label: 'Dashboard' },
        { path: '/map', icon: FiMap, label: 'Live Map' },
        { path: '/vehicles', icon: FiTruck, label: 'Vehicles' },
        { path: '/routes', icon: FiNavigation, label: 'Routes' },
      ]},
      { section: 'Operations', items: [
        { path: '/incidents', icon: FiAlertTriangle, label: 'Incidents' },
        { path: '/alerts', icon: FiBell, label: 'Alerts' },
        { path: '/logistics', icon: FiPackage, label: 'Logistics' },
        { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
      ]},
      { section: 'System', items: [
        { path: '/field-reports', icon: FiFileText, label: 'Field Reports' },
        { path: '/simulation', icon: FiPlay, label: 'Live Simulation' },
        { path: '/settings', icon: FiSettings, label: 'Settings & Audit' },
      ]}
    ];
  }

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">🚛</div>
          <h1>NER Logistics<span>Intelligence Platform</span></h1>
        </div>

        <nav className="sidebar-nav">
          {roleNavItems.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="sidebar-section-title">{group.section}</div>
              {group.items.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={() => setSidebarOpen(false)}>
                  <span className="nav-icon"><item.icon /></span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          <button onClick={onLogout} style={{ marginTop: 12 }}>
            <span className="nav-icon"><FiLogOut /></span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <span className="page-title">{pageTitle}</span>
          <span className="region-badge">📍 North Eastern Region</span>
        </div>
        <div className="topbar-right">
          <div className="topbar-search">
            <FiSearch size={16} color="#94a3b8" />
            <input type="text" placeholder="Search roads, vehicles, districts..." />
          </div>
          <button className="topbar-icon-btn">
            <FiBell />
            <span className="badge">5</span>
          </button>
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
            <div className="user-info">
              <span className="name">{user?.name || 'User'}</span>
              <span className="role">{user?.role?.replace('_', ' ') || 'Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
