import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { FiGrid, FiMap, FiTruck, FiNavigation, FiAlertTriangle, FiBell, FiPackage, FiBarChart2, FiFileText, FiSettings, FiSearch, FiMenu, FiX, FiLogOut, FiPlay, FiGlobe, FiCheck } from 'react-icons/fi';
import { alertsAPI } from '../services/api';
import { LANGUAGES, getTranslation, translateAlert } from '../utils/i18n';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('ner_lang') || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'admin';

  const loadAlertsData = () => {
    alertsAPI.getUnreadCount()
      .then(res => {
        if (res?.data?.count !== undefined) setUnreadCount(res.data.count);
      })
      .catch(() => {});

    alertsAPI.getAll({ isRead: false })
      .then(res => {
        if (res?.data) setRecentAlerts(res.data.slice(0, 5));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAlertsData();
    const interval = setInterval(loadAlertsData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('ner_lang', lang);
    window.dispatchEvent(new CustomEvent('ner_language_changed', { detail: lang }));
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await alertsAPI.markRead(alertId);
      setRecentAlerts(prev => prev.filter(a => a.alertId !== alertId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('road') || q.includes('nh-') || q.includes('sh-')) {
      navigate('/map');
    } else if (q.includes('truck') || q.includes('ner-') || q.includes('vehic')) {
      navigate('/vehicles');
    } else if (q.includes('deliver') || q.includes('cargo') || q.includes('del-')) {
      navigate('/logistics');
    } else if (q.includes('incid') || q.includes('landslide') || q.includes('flood')) {
      navigate('/incidents');
    } else {
      navigate('/map');
    }
  };

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
        <div className="topbar-right" style={{ position: 'relative' }}>
          {/* Functional Search Bar */}
          <form className="topbar-search" onSubmit={handleSearchSubmit}>
            <FiSearch size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder={getTranslation('searchPlaceholder', currentLang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Multilingual Selector (Requirement H) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: '4px 8px' }}>
            <FiGlobe size={14} color="#64748b" />
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Switch Platform Language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* Live Notification Bell & Dropdown (Requirement 28) */}
          <div style={{ position: 'relative' }}>
            <button
              className="topbar-icon-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Emergency Notifications"
            >
              <FiBell />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {/* Interactive Notification Panel */}
            {notificationsOpen && (
              <div style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 360,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                border: '1px solid #e2e8f0',
                zIndex: 9999,
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{getTranslation('notifications', currentLang)}</span>
                    <span className="badge-status critical" style={{ fontSize: 11 }}>{unreadCount} Active</span>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {recentAlerts.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      ✅ {getTranslation('noAlerts', currentLang)}
                    </div>
                  ) : (
                    recentAlerts.map(alert => {
                      const tAlert = translateAlert(alert, currentLang);
                      return (
                        <div
                          key={alert.alertId}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f1f5f9',
                            background: alert.severity === 'Critical' ? '#fff5f5' : '#fff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: alert.severity === 'Critical' ? '#dc2626' : '#d97706',
                              textTransform: 'uppercase'
                            }}>
                              {tAlert.translatedSeverity || alert.severity}
                            </span>
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.alertId)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                fontSize: 11,
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                cursor: 'pointer',
                                color: '#334155'
                              }}
                              title="Acknowledge Alert"
                            >
                              <FiCheck size={11} /> {getTranslation('alertAcknowledge', currentLang)}
                            </button>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                            {tAlert.translatedTitle || alert.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                            {tAlert.translatedMessage || alert.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{
                  padding: '10px 16px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <Link
                    to="/alerts"
                    onClick={() => setNotificationsOpen(false)}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    {getTranslation('viewAllAlerts', currentLang)}
                  </Link>
                </div>
              </div>
            )}
          </div>

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
