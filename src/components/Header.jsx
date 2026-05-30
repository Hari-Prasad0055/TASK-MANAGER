import React, { useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Store,
  Sparkles
} from 'lucide-react';
import { formatDateStr } from '../utils/productivity';

export default function Header({ selectedDate, setSelectedDate, searchQuery, setSearchQuery, score, user, onLogout }) {
  const dateInputRef = useRef(null);

  // Parse selected date and handle adjustments
  const handleDateAdjust = (offset) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(formatDateStr(current));
  };

  // Human readable date representation (e.g., "Saturday, May 30")
  const getFriendlyDate = () => {
    const d = new Date(selectedDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (formatDateStr(d) === formatDateStr(today)) return 'Today, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (formatDateStr(d) === formatDateStr(yesterday)) return 'Yesterday, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Determine user level based on score
  const getProducerTag = () => {
    if (score >= 90) return 'Focus Maestro';
    if (score >= 70) return 'High Producer';
    if (score >= 40) return 'Active Operator';
    return 'Base Producer';
  };

  return (
    <header className="app-header">
      {/* Brand Icon for Mobile Views */}
      <div className="mobile-brand">
        <Store size={22} className="mobile-logo-icon" />
        <span className="mobile-brand-title">ProdMarket</span>
      </div>

      {/* Modern Search */}
      <div className="header-search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search task descriptions or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="header-search-input"
        />
      </div>

      {/* Date Navigation Slider */}
      <div className="date-nav-capsule">
        <button
          onClick={() => handleDateAdjust(-1)}
          className="date-nav-btn"
          title="Previous day"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
          className="date-display-trigger"
          title="Select specific date"
        >
          <Calendar size={15} className="calendar-trigger-icon" />
          <span className="friendly-date">{getFriendlyDate()}</span>

          <input
            type="date"
            ref={dateInputRef}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="hidden-date-input"
          />
        </div>

        <button
          onClick={() => handleDateAdjust(1)}
          className="date-nav-btn"
          title="Next day"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Profile Capsule */}
      <div className="profile-capsule">
        <div className="profile-details">
          <div className="profile-level">
            <Sparkles size={11} className="level-icon" />
            <span>{getProducerTag()}</span>
          </div>
          <span className="profile-name">{user ? user.username : 'Guest User'}</span>
        </div>
        
        <div className="profile-dropdown-container" tabIndex="0">
          <div className="profile-avatar" style={{ cursor: 'pointer' }}>
            {user ? user.username.substring(0, 2).toUpperCase() : 'GS'}
            <span className="online-dot" style={{ backgroundColor: user ? 'var(--accent-success)' : '#94a3b8' }}></span>
          </div>
          
          <div className="profile-dropdown animate-slide-up">
            <div className="dropdown-user-info">
              <span className="dropdown-username">{user ? user.username : 'Guest Mode'}</span>
              <span className="dropdown-status">{user ? 'Cloud Synced' : 'Local Storage'}</span>
            </div>
            <div className="dropdown-divider"></div>
            <button onClick={onLogout} className="dropdown-logout-btn">
              {user ? 'Log Out' : 'Exit Guest Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Isolated Header CSS styling */}
      <style>{`
        .app-header {
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 50;
          height: 64px;
          gap: 1rem;
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .mobile-brand {
            display: none;
          }
        }

        .mobile-logo-icon {
          color: var(--brand-primary);
        }

        .mobile-brand-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .header-search-container {
          display: none;
          align-items: center;
          position: relative;
          width: 320px;
        }

        @media (min-width: 768px) {
          .header-search-container {
            display: flex;
          }
        }

        .search-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .header-search-input {
          font-family: var(--font-sans);
          width: 100%;
          padding: 0.5rem 0.875rem 0.5rem 2.25rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          transition: var(--transition-smooth);
        }

        .header-search-input:focus {
          outline: none;
          background-color: white;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .date-nav-capsule {
          display: flex;
          align-items: center;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          padding: 0.2rem;
          box-shadow: var(--shadow-sm);
        }

        .date-nav-btn {
          background: transparent;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }

        .date-nav-btn:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .date-display-trigger {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0 0.75rem;
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        .calendar-trigger-icon {
          color: var(--brand-primary);
        }

        .friendly-date {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .hidden-date-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .profile-capsule {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profile-details {
          display: none;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        @media (min-width: 640px) {
          .profile-details {
            display: flex;
          }
        }

        .profile-level {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          background-color: var(--brand-primary-light);
          color: var(--brand-primary);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .level-icon {
          color: var(--brand-primary);
        }

        .profile-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .profile-avatar {
          background: linear-gradient(135deg, #0ea5e9 0%, var(--brand-primary) 100%);
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          position: relative;
          user-select: none;
        }

        .online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 8px;
          height: 8px;
          background-color: var(--accent-success);
          border: 2px solid white;
          border-radius: 50%;
        }

        .profile-dropdown-container {
          position: relative;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.75rem;
          min-width: 160px;
          display: none;
          flex-direction: column;
          z-index: 100;
        }

        .profile-dropdown::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 0;
          width: 100%;
          height: 12px;
          background: transparent;
        }

        .profile-dropdown-container:hover .profile-dropdown,
        .profile-dropdown-container:focus-within .profile-dropdown {
          display: flex;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          padding: 0.25rem 0.5rem;
          text-align: left;
        }

        .dropdown-username {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dropdown-status {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 0.5rem 0;
        }

        .dropdown-logout-btn {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          color: #e11d48;
          background-color: transparent;
          border: 1px solid transparent;
          padding: 0.375rem 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-align: left;
          transition: var(--transition-smooth);
        }

        .dropdown-logout-btn:hover {
          background-color: #fff1f2;
          border-color: rgba(225, 29, 72, 0.1);
        }

        .animate-slide-up {
          animation: dropdown-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdown-slide {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </header>
  );
}
