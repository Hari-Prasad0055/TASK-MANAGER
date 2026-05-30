import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, Download, Upload, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export default function Settings({ 
  targetHours, 
  setTargetHours, 
  onLoadMockData, 
  onClearAllData, 
  onImportData, 
  onExportData 
}) {
  const [hoursVal, setHoursVal] = useState(targetHours);
  const [importText, setImportText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveGoal = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const parsed = parseFloat(hoursVal);
    if (isNaN(parsed) || parsed <= 0 || parsed > 24) {
      setErrorMsg('Please select a valid target goal between 0.5 and 24 hours.');
      return;
    }

    setTargetHours(parsed);
    setSuccessMsg('Daily target goal saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExport = () => {
    const dataStr = onExportData();
    navigator.clipboard.writeText(dataStr);
    setSuccessMsg('Database copied to clipboard! You can paste it anywhere to backup.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleImport = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (!importText.trim()) {
        setErrorMsg('Please paste your backup JSON first.');
        return;
      }
      const success = onImportData(importText);
      if (success) {
        setSuccessMsg('Database imported and reloaded successfully!');
        setImportText('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Invalid schema. Make sure the JSON represents key-value date blocks.');
      }
    } catch (err) {
      setErrorMsg('Invalid JSON format: ' + err.message);
    }
  };

  return (
    <div className="settings-pane">
      <div className="panel-header">
        <h2 className="panel-title">
          <SettingsIcon size={18} className="text-teal" />
          <span>Productivity Calibration</span>
        </h2>
        <span className="panel-subtitle">Preferences</span>
      </div>

      {successMsg && (
        <div className="alert-badge success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-badge error">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      <div className="settings-grid">
        
        {/* Left Column: Target Goals */}
        <div className="panel settings-panel-item">
          <h3 className="settings-section-title">
            <Save size={16} />
            <span>Focused Target Goals</span>
          </h3>
          <p className="settings-desc">
            Define your daily standard focused time target. This value is used in your dashboard meters to measure planned velocity.
          </p>

          <form onSubmit={handleSaveGoal}>
            <div className="form-group">
              <label className="form-label">Daily Target (Hours)</label>
              <div className="flex-row-input">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  value={hoursVal}
                  onChange={(e) => setHoursVal(e.target.value)}
                  className="form-input"
                />
                <button type="submit" className="btn btn-primary">
                  Save Goal
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Database Maintenance */}
        <div className="panel settings-panel-item">
          <h3 className="settings-section-title">
            <Database size={16} />
            <span>Cloud Database Maintenance</span>
          </h3>
          <p className="settings-desc">
            Control persistent databases. Inject realistic past-30-days mock metrics to test charting dashboards, or purge tasks. Changes will synchronize with MongoDB.
          </p>

          <div className="action-buttons-stack">
            <button 
              onClick={() => {
                if (window.confirm('Wipe and reload mock database? Custom changes will be replaced.')) {
                  onLoadMockData();
                  setSuccessMsg('Deterministic 30-day mock history injected successfully!');
                  setTimeout(() => setSuccessMsg(''), 3000);
                }
              }}
              className="btn btn-secondary flex-start"
            >
              <RefreshCw size={14} />
              <span>Infect/Inject 30-Day Mock Database</span>
            </button>

            <button 
              onClick={() => {
                if (window.confirm('WARNING: Wiping database will delete all scheduled tasks permanently. Continue?')) {
                  onClearAllData();
                  setSuccessMsg('Local database completely purged.');
                  setTimeout(() => setSuccessMsg(''), 3000);
                }
              }}
              className="btn btn-secondary flex-start text-danger"
            >
              <Trash2 size={14} />
              <span>Purge All Tasks Database</span>
            </button>
          </div>
        </div>

        {/* Bottom Full Row: Backup & Restore */}
        <div className="panel settings-panel-item backup-panel">
          <h3 className="settings-section-title">
            <Download size={16} />
            <span>Data Sync (Backup, Restore & MongoDB Sync)</span>
          </h3>
          <p className="settings-desc">
            Export all scheduled task indexes into a JSON format block. Paste or import backups to restore settings and immediately synchronize them to MongoDB.
          </p>

          <div className="backup-row">
            <div className="export-col">
              <button onClick={handleExport} className="btn btn-secondary w-full">
                <Download size={14} />
                <span>Export & Copy Database JSON</span>
              </button>
              <span className="info-subtext">Clicking copies the entire database object to clipboard.</span>
            </div>

            <div className="import-col">
              <form onSubmit={handleImport} className="import-form">
                <textarea
                  placeholder="Paste database JSON block here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="form-input text-area"
                  rows={3}
                />
                <button type="submit" className="btn btn-primary w-full">
                  <Upload size={14} />
                  <span>Import & Restore JSON</span>
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .settings-pane {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .alert-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .alert-badge.success {
          background-color: var(--brand-primary-light);
          color: var(--brand-primary);
          border: 1px solid rgba(13, 148, 136, 0.15);
        }

        .alert-badge.error {
          background-color: #fff1f2;
          color: #be123c;
          border: 1px solid rgba(225, 29, 72, 0.15);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .settings-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .backup-panel {
            grid-column: span 2;
          }
        }

        .settings-panel-item {
          display: flex;
          flex-direction: column;
        }

        .settings-section-title {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .settings-desc {
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        .flex-row-input {
          display: flex;
          gap: 0.5rem;
        }

        .flex-row-input .form-input {
          width: 80px;
          flex: none;
        }

        .action-buttons-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
          justify-content: center;
        }

        .flex-start {
          justify-content: flex-start;
        }

        .text-danger {
          color: #ef4444 !important;
          border-color: rgba(239, 68, 68, 0.15) !important;
        }

        .text-danger:hover {
          background-color: #fee2e2 !important;
          border-color: #ef4444 !important;
        }

        .backup-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .backup-row {
            grid-template-columns: 1fr 1.5fr;
          }
        }

        .export-col {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-subtext {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .import-col {
          display: flex;
          flex-direction: column;
        }

        .import-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
