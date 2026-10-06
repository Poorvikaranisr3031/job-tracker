import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searched, setSearched] = useState(false);
  const [mode, setMode] = useState('feed'); // 'feed' = free auto-updating, 'real' = Google Jobs (limited)

  const { user } = useAuth();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFeedJobs();

    // Auto-refresh the free feed every 3 minutes
    intervalRef.current = setInterval(() => {
      if (mode === 'feed') fetchFeedJobs(true);
    }, 3 * 60 * 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchFeedJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/jobs', { params: { keyword } });
      setJobs(res.data.jobs);
      setSearched(true);
    } catch (err) {
      console.error(err);
      if (!silent) toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/real-search', {
        params: { keyword: keyword || 'software developer', location: 'India' },
      });
      setJobs(res.data.jobs);
      setSearched(true);
      if (res.data.jobs.length === 0) {
        toast.info('No real listings found for this search — try a different keyword');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch real listings (quota may be used up)');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (mode === 'feed') fetchFeedJobs();
    else fetchRealJobs();
  };

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="page-title">Find Opportunities</h2>

      <div className="jobs-mode-toggle">
        <button
          className={mode === 'feed' ? 'mode-btn active' : 'mode-btn'}
          onClick={() => { setMode('feed'); fetchFeedJobs(); }}
        >
          🔄 Live Feed (auto-updates)
        </button>
        <button
          className={mode === 'real' ? 'mode-btn active' : 'mode-btn'}
          onClick={() => setMode('real')}
        >
          🔍 Real Listings (LinkedIn/Naukri via Google) — limited searches
        </button>
      </div>

      <form className="jobs-search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder={mode === 'feed' ? 'Search by title, company, or skill' : 'e.g. "React developer intern"'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit" className="add-btn">Search</button>
      </form>

      {mode === 'real' && (
        <p className="quota-note">
          ⚠️ Real listings use a limited free quota (100 total searches). Use this mode only when you specifically want to see live LinkedIn/Naukri-sourced jobs.
        </p>
      )}

      {loading && <p>Loading jobs...</p>}

      {!loading && searched && jobs.length === 0 && (
        <p className="no-apps">No jobs found. Try a different search.</p>
      )}

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <span className="job-source-tag">{job.source}</span>
            <h4>{job.title}</h4>
            <p className="job-company">{job.company} · {job.location}</p>
            <p className="job-description">{stripHtml(job.description).slice(0, 180)}...</p>
            <div className="job-card-actions">
              <a href={job.url} target="_blank" rel="noreferrer" className="job-view-btn">
                View & Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Jobs;