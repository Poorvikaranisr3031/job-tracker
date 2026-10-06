import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Interview: '#f59e0b',
  Offer: '#22c55e',
  Rejected: '#ef4444',
};

function AnalyticsPanel({ applications }) {
  const statusData = ['Applied', 'Interview', 'Offer', 'Rejected'].map((status) => ({
    name: status,
    value: applications.filter((a) => a.status === status).length,
  })).filter((d) => d.value > 0);

  // Group applications by month for the timeline chart
  const monthCounts = {};
  applications.forEach((app) => {
    const date = new Date(app.createdAt);
    const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });
  const timelineData = Object.entries(monthCounts).map(([month, count]) => ({ month, count }));

  if (applications.length === 0) {
    return <p className="empty-column">Add some applications to see analytics.</p>;
  }

  return (
    <div className="analytics-grid">
      <div className="chart-card">
        <h4>Status Breakdown</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#151b2b', border: '1px solid #2a3347', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h4>Applications Over Time</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#151b2b', border: '1px solid #2a3347', borderRadius: '8px' }} />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsPanel;