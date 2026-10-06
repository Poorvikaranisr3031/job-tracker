const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/real-search', async (req, res) => {
  try {
    const { keyword = 'software developer', location = 'India' } = req.query;

    const params = new URLSearchParams({
      engine: 'google_jobs',
      q: keyword,
      location,
      api_key: process.env.SEARCHAPI_KEY,
    });

    const response = await fetch(`https://www.searchapi.io/api/v1/search?${params}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('SearchAPI error:', data);
      return res.status(response.status).json({ message: 'Failed to fetch real listings', details: data });
    }

    const jobs = (data.jobs || []).map((job, idx) => ({
      id: `searchapi-${idx}-${Date.now()}`,
      title: job.title,
      company: job.company_name || 'Unknown',
      location: job.location || location,
      description: job.description,
      url: job.apply_link || job.share_link || '#',
      created: job.detected_extensions?.posted_at || '',
      tags: [],
      source: job.via || 'Google Jobs',
    }));

    res.status(200).json({ jobs, count: jobs.length });
  } catch (err) {
    console.error('Real jobs fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const fetchArbeitnow = async (page) => {
  try {
    const response = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobTrackerApp/1.0)',
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    return (data.data || []).map((job) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name || 'Unknown',
      location: job.location || 'Remote / Not specified',
      description: job.description,
      url: job.url,
      created: job.created_at,
      tags: job.tags || [],
      source: 'Arbeitnow',
    }));
  } catch (err) {
    console.error('Arbeitnow fetch failed:', err.message);
    return [];
  }
};

const fetchRemotive = async () => {
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobTrackerApp/1.0)',
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    return (data.jobs || []).map((job) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name || 'Unknown',
      location: job.candidate_required_location || 'Remote',
      description: job.description,
      url: job.url,
      created: job.publication_date,
      tags: job.tags || [],
      source: 'Remotive',
    }));
  } catch (err) {
    console.error('Remotive fetch failed:', err.message);
    return [];
  }
};

router.get('/', async (req, res) => {
  try {
    const { keyword = '', page = 1 } = req.query;

    const [arbeitnowJobs, remotiveJobs] = await Promise.all([
      fetchArbeitnow(page),
      fetchRemotive(),
    ]);

    let jobs = [...arbeitnowJobs, ...remotiveJobs];

    // Broader India/remote/worldwide filter
    jobs = jobs.filter((j) => {
      const loc = j.location.toLowerCase();
      return (
        loc.includes('india') ||
        loc.includes('remote') ||
        loc.includes('worldwide') ||
        loc.includes('anywhere') ||
        j.tags.some((t) => t.toLowerCase().includes('remote'))
      );
    });

    if (keyword.trim()) {
      const term = keyword.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company.toLowerCase().includes(term) ||
          j.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    // Newest first
    jobs.sort((a, b) => new Date(b.created) - new Date(a.created));

    res.status(200).json({ jobs, count: jobs.length });
  } catch (err) {
    console.error('Jobs fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;