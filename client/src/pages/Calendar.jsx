import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Calendar() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/applications')
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followUpDates = applications
    .filter((a) => a.followUpDate)
    .map((a) => ({ ...a, dateObj: new Date(a.followUpDate) }));

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isOverdue = (app) => {
  const d = new Date(app.followUpDate);
  d.setHours(0, 0, 0, 0);
  return d < today && app.status !== 'Offer' && app.status !== 'Rejected';
};

  const overdueApps = followUpDates.filter(isOverdue);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const matches = followUpDates.filter((f) => isSameDay(f.dateObj, date));
    if (matches.length === 0) return null;
    const anyOverdue = matches.some(isOverdue);
    return <div className={`calendar-dot ${anyOverdue ? 'overdue-dot' : ''}`} />;
  };

  const selectedDayApps = followUpDates.filter((f) => isSameDay(f.dateObj, selectedDate));

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="page-title">Follow-up Calendar</h2>

      {overdueApps.length > 0 && (
        <div className="overdue-banner">
          ⚠️ You have {overdueApps.length} overdue follow-up{overdueApps.length > 1 ? 's' : ''}:{' '}
          {overdueApps.map((a) => `${a.company} (${a.role})`).join(', ')}
        </div>
      )}

      <div className="calendar-layout">
        <div className="calendar-wrapper">
          <ReactCalendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
        </div>

        <div className="calendar-sidebar">
          <h4>{selectedDate.toDateString()}</h4>
          {selectedDayApps.length === 0 ? (
            <p className="no-apps">No follow-ups on this day.</p>
          ) : (
            selectedDayApps.map((app) => (
              <div key={app._id} className={`calendar-app-card ${isOverdue(app) ? 'overdue-card' : ''}`}>
                <h5>{app.role}</h5>
                <p className="company-name">{app.company}</p>
                <span className={`status-badge status-${app.status}`}>{app.status}</span>
                {isOverdue(app) && <p className="overdue-tag">⚠️ Overdue</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;