import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AnalyticsPanel from '../components/AnalyticsPanel';

function Analytics() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    api.get('/applications')
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="page-title">Analytics</h2>
      {loading ? <p>Loading...</p> : <AnalyticsPanel applications={applications} />}
    </div>
  );
}

export default Analytics;