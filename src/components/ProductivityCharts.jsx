import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  calculateDailyScore, 
  calculatePlannedHours, 
  calculateFocusedHours,
  formatDateStr
} from '../utils/productivity';
import { TrendingUp, Clock, PieChart as PieIcon, Award } from 'lucide-react';

export default function ProductivityCharts({ allTasks, selectedDate }) {
  
  // Helper: Get past date strings
  const getPastDates = (baseDateStr, daysCount) => {
    const dates = [];
    const base = new Date(baseDateStr);
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      dates.push(formatDateStr(d));
    }
    return dates;
  };

  // Generate date windows
  const last7Dates = getPastDates(selectedDate, 7);
  const last30Dates = getPastDates(selectedDate, 30);

  // 1. Prepare 7-Day Performance Data (Line & Bar charts)
  const last7DaysData = last7Dates.map((dateStr) => {
    const tasks = allTasks[dateStr] || [];
    const score = calculateDailyScore(tasks);
    const planned = calculatePlannedHours(tasks);
    const focused = calculateFocusedHours(tasks);
    
    const d = new Date(dateStr);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      dayLabel,
      shortDate,
      score,
      planned: parseFloat(planned.toFixed(1)),
      focused: parseFloat(focused.toFixed(1))
    };
  });

  // 2. Prepare 30-Day Trend Data (Area chart)
  const last30DaysData = last30Dates.map((dateStr) => {
    const tasks = allTasks[dateStr] || [];
    const score = calculateDailyScore(tasks);
    const d = new Date(dateStr);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      label,
      score
    };
  });

  // 3. Prepare 7-Day Category Breakdown (Pie chart)
  const categorySummaryMap = {};
  last7Dates.forEach((dateStr) => {
    const tasks = allTasks[dateStr] || [];
    tasks.forEach((t) => {
      if (t.status === 'completed') {
        const duration = Math.max(0.25, (t.endTime.split(':').map(Number)[0] + t.endTime.split(':').map(Number)[1]/60) - 
                                     (t.startTime.split(':').map(Number)[0] + t.startTime.split(':').map(Number)[1]/60));
        categorySummaryMap[t.category] = (categorySummaryMap[t.category] || 0) + duration;
      }
    });
  });

  const CATEGORY_COLORS = {
    'Deep Work': '#6366f1', // Indigo
    'Coding': '#0ea5e9', // Sky
    'Meetings': '#ec4899', // Pink
    'Health & Sport': '#10b981', // Emerald
    'Administrative': '#f59e0b', // Amber
    'Personal Growth': '#8b5cf6' // Violet
  };

  const pieData = Object.keys(categorySummaryMap).map((catName) => ({
    name: catName,
    value: parseFloat(categorySummaryMap[catName].toFixed(1)),
    color: CATEGORY_COLORS[catName] || '#64748b'
  })).sort((a, b) => b.value - a.value);

  // Custom tooltips for premium polish
  const CustomScoreTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-chart-tooltip">
          <span className="tooltip-date">{data.shortDate || data.label}</span>
          <div className="tooltip-metric">
            <span className="dot teal"></span>
            <span className="tooltip-label">Productivity:</span>
            <span className="tooltip-value">{payload[0].value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomHoursTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-chart-tooltip">
          <span className="tooltip-date">{data.shortDate}</span>
          <div className="tooltip-metric flex-col">
            <div className="flex-row">
              <span className="dot amber"></span>
              <span className="tooltip-label">Planned:</span>
              <span className="tooltip-value">{data.planned} hrs</span>
            </div>
            <div className="flex-row">
              <span className="dot teal"></span>
              <span className="tooltip-label">Focused:</span>
              <span className="tooltip-value">{data.focused} hrs</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-container">
      {/* 1. Daily Productivity & Weekly Hours Row */}
      <div className="charts-grid-row">
        
        {/* Line Chart */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <TrendingUp size={16} className="text-teal" />
              <span>7-Day Productivity Score</span>
            </h3>
            <span className="panel-subtitle">Rolling Performance</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomScoreTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--brand-primary)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--brand-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Clock size={16} style={{ color: '#6366f1' }} />
              <span>Time Budget Allocation</span>
            </h3>
            <span className="panel-subtitle">Planned vs. Focused</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomHoursTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar name="Planned Hours" dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar name="Focused (Completed) Hours" dataKey="focused" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 2. Category Pie & 30-Day Area Row */}
      <div className="charts-grid-row second">
        
        {/* Category Donut */}
        <div className="panel chart-panel donut-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <PieIcon size={16} style={{ color: '#ec4899' }} />
              <span>Focus Distribution</span>
            </h3>
            <span className="panel-subtitle">Last 7 Days Hours</span>
          </div>
          {pieData.length > 0 ? (
            <div className="donut-layout">
              <div className="chart-wrapper donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hrs`, 'Focused Time']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-label">
                  <Award size={20} className="text-teal" />
                </div>
              </div>
              
              <div className="donut-legends">
                {pieData.map((item, index) => (
                  <div key={index} className="donut-legend-item">
                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-value">{item.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-chart-state">
              <p>No completed tasks in the last 7 days to analyze distribution.</p>
              <span>Complete tasks to see category-wise breakdown!</span>
            </div>
          )}
        </div>

        {/* 30-Day Area Chart */}
        <div className="panel chart-panel thirty-day-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <TrendingUp size={16} className="text-teal" />
              <span>30-Day Productivity Index</span>
            </h3>
            <span className="panel-subtitle">Long-term Velocity</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} minTickGap={30} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomScoreTooltip />} />
                <Area type="monotone" dataKey="score" stroke="var(--brand-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <style>{`
        .charts-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .charts-grid-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .charts-grid-row {
            grid-template-columns: 1.2fr 1fr;
          }
          .charts-grid-row.second {
            grid-template-columns: 1fr 1.2fr;
          }
        }

        .chart-panel {
          min-height: 360px;
          display: flex;
          flex-direction: column;
        }

        .panel-subtitle {
          font-size: 0.7rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
        }

        .chart-wrapper {
          flex: 1;
          position: relative;
          min-height: 250px;
          width: 100%;
        }

        .chart-wrapper.donut {
          width: 140px;
          height: 140px;
          flex: none;
        }

        /* Donut Center Icon Placement */
        .donut-center-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--brand-primary-light);
          pointer-events: none;
        }

        /* Donut Layout Grid */
        .donut-panel {
          min-height: 360px;
        }

        .donut-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          flex: 1;
        }

        @media (min-width: 640px) {
          .donut-layout {
            flex-direction: row;
            padding: 0 1rem;
          }
        }

        .donut-legends {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          width: 100%;
        }

        .donut-legend-item {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-secondary);
          gap: 0.35rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-name {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-weight: 500;
          flex: 1;
        }

        .legend-value {
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Premium HTML tooltip styles */
        .custom-chart-tooltip {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(4px);
          font-size: 0.75rem;
        }

        .tooltip-date {
          display: block;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.15rem;
        }

        .tooltip-metric {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .tooltip-metric.flex-col {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.15rem;
        }

        .tooltip-metric .flex-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.teal { background-color: var(--brand-primary); }
        .dot.amber { background-color: #cbd5e1; }

        .tooltip-label {
          color: var(--text-secondary);
        }

        .tooltip-value {
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-chart-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          padding: 2rem;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
          margin-top: 0.5rem;
        }

        .empty-chart-state p {
          font-weight: 600;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
