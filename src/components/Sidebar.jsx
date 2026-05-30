import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  BarChart3, 
  TrendingUp, 
  FolderKanban, 
  Settings as SettingsIcon,
  Store
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overall stats & summary' },
    { id: 'today', label: 'Today Planner', icon: CalendarRange, desc: 'Task scheduler timeline' },
    { id: 'weekly', label: 'Weekly Report', icon: BarChart3, desc: 'Time & completion analysis' },
    { id: 'monthly', label: 'Monthly Report', icon: TrendingUp, desc: '30-day productivity trends' },
    { id: 'categories', label: 'Categories', icon: FolderKanban, desc: 'Manage your focus areas' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, desc: 'Goals & localStorage controls' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Store className="brand-logo-icon" size={24} />
          </div>
          <div>
            <h1 className="brand-title">ProdMarket</h1>
            <span className="brand-tagline">Productivity Exchange</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.desc}
              >
                <div className={`sidebar-icon-wrapper ${isActive ? 'active' : ''}`}>
                  <Icon size={20} className="nav-icon" />
                </div>
                <div className="sidebar-nav-text">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-desc">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pro-badge">
            <span className="pro-pill">PRODUCER LEVEL 4</span>
            <div className="pro-progress-bar">
              <div className="pro-progress-fill" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="mobile-bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="mobile-nav-label">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Specific CSS Styles Injection (to keep layout isolated and ultra-clean) */}
      <style>{`
        .desktop-sidebar {
          display: none;
          flex-direction: column;
          width: 260px;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          height: 100vh;
          position: sticky;
          top: 0;
          padding: 1.5rem 1.25rem;
          z-index: 100;
        }

        @media (min-width: 768px) {
          .desktop-sidebar {
            display: flex;
          }
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding-left: 0.25rem;
        }

        .brand-logo {
          background: linear-gradient(135deg, var(--brand-primary) 0%, #0ea5e9 100%);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(13, 148, 136, 0.2);
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .brand-tagline {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.75rem;
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: var(--transition-smooth);
        }

        .sidebar-nav-item:hover {
          background-color: var(--bg-primary);
        }

        .sidebar-nav-item.active {
          background-color: var(--brand-primary-light);
        }

        .sidebar-icon-wrapper {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          transition: var(--transition-smooth);
          background-color: transparent;
        }

        .sidebar-icon-wrapper.active {
          color: var(--brand-primary);
          background-color: rgba(13, 148, 136, 0.1);
        }

        .sidebar-nav-item:hover .nav-icon {
          transform: scale(1.05);
        }

        .sidebar-nav-text {
          display: flex;
          flex-direction: column;
        }

        .nav-label {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }

        .sidebar-nav-item.active .nav-label {
          color: var(--brand-primary);
        }

        .nav-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.05rem;
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
        }

        .user-pro-badge {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.875rem;
        }

        .pro-pill {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--brand-primary);
          background-color: var(--brand-primary-light);
          padding: 0.15rem 0.4rem;
          border-radius: 9999px;
          margin-bottom: 0.5rem;
        }

        .pro-progress-bar {
          background-color: #e2e8f0;
          height: 4px;
          border-radius: 2px;
          width: 100%;
          overflow: hidden;
        }

        .pro-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--brand-primary), #0ea5e9);
          border-radius: 2px;
        }

        /* Mobile CSS */
        .mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          height: 60px;
          justify-content: space-around;
          align-items: center;
          z-index: 900;
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
        }

        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none;
          }
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.65rem;
          flex: 1;
          height: 100%;
          gap: 0.15rem;
          transition: var(--transition-smooth);
        }

        .mobile-nav-item.active {
          color: var(--brand-primary);
        }

        .mobile-nav-label {
          font-family: var(--font-sans);
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
