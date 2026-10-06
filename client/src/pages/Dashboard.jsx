import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PrepNotesModal from '../components/PrepNotesModal';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [jobLink, setJobLink] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [dragOverCol, setDragOverCol] = useState(null);

  const [prepApp, setPrepApp] = useState(null);

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCompany('');
    setRole('');
    setStatus('Applied');
    setJobLink('');
    setNotes('');
    setFollowUpDate('');
    setResumeFile(null);
    setEditingApp(null);
    setShowForm(false);
    setShowDuplicateWarning(false);
    setConfirmDuplicate(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingApp) {
      const isDuplicate = applications.some(
        (a) =>
          a.company.trim().toLowerCase() === company.trim().toLowerCase() &&
          a.role.trim().toLowerCase() === role.trim().toLowerCase()
      );
      if (isDuplicate && !confirmDuplicate) {
        setShowDuplicateWarning(true);
        return;
      }
    }

    try {
      const payload = { company, role, status, jobLink, notes, followUpDate };
      let savedApp;
      if (editingApp) {
        const res = await api.put(`/applications/${editingApp._id}`, payload);
        savedApp = res.data;
        toast.success('Application updated');
      } else {
        const res = await api.post('/applications', payload);
        savedApp = res.data;
        toast.success('Application added');
      }

      if (resumeFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        await api.post(`/applications/${savedApp._id}/resume`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Resume uploaded');
        setUploading(false);
      }

      resetForm();
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
      setUploading(false);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setCompany(app.company);
    setRole(app.role);
    setStatus(app.status);
    setJobLink(app.jobLink || '');
    setNotes(app.notes || '');
    setFollowUpDate(app.followUpDate ? app.followUpDate.split('T')[0] : '');
    setResumeFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      toast.success('Application deleted');
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (app, newStatus) => {
    if (app.status === newStatus) return;
    setApplications((prev) =>
      prev.map((a) => (a._id === app._id ? { ...a, status: newStatus } : a))
    );
    try {
      await api.put(`/applications/${app._id}`, { ...app, status: newStatus });
      toast.info(`Moved to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
      fetchApplications();
    }
  };

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('appId', appId);
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    setDragOverCol(col);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handlePrepUpdate = (updatedApp) => {
    setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
    setPrepApp(updatedApp);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const appId = e.dataTransfer.getData('appId');
    const app = applications.find((a) => a._id === appId);
    if (app) handleStatusChange(app, newStatus);
  };

  const visibleApplications = useMemo(() => {
    let result = applications.filter((app) => {
      const term = searchTerm.toLowerCase();
      return (
        app.company.toLowerCase().includes(term) ||
        app.role.toLowerCase().includes(term)
      );
    });
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [applications, searchTerm, sortOrder]);

  const statCounts = useMemo(() => {
    const counts = { Total: applications.length, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    applications.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return counts;
  }, [applications]);

  const exportCSV = () => {
    if (applications.length === 0) {
      toast.info('No applications to export');
      return;
    }
    const headers = ['Company', 'Role', 'Status', 'Date Applied', 'Follow Up', 'Job Link', 'Notes'];
    const rows = applications.map((a) => [
      a.company,
      a.role,
      a.status,
      new Date(a.dateApplied).toLocaleDateString(),
      a.followUpDate ? new Date(a.followUpDate).toLocaleDateString() : '',
      a.jobLink || '',
      (a.notes || '').replace(/,/g, ';'),
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'job_applications.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const exportPDF = () => {
    if (applications.length === 0) {
      toast.info('No applications to export');
      return;
    }
    const doc = new jsPDF();
    doc.text('Job Applications', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Company', 'Role', 'Status', 'Date Applied', 'Follow Up']],
      body: applications.map((a) => [
        a.company,
        a.role,
        a.status,
        new Date(a.dateApplied).toLocaleDateString(),
        a.followUpDate ? new Date(a.followUpDate).toLocaleDateString() : '-',
      ]),
    });
    doc.save('job_applications.pdf');
    toast.success('PDF exported');
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="stats-bar">
        {['Total', ...STATUSES].map((label) => (
          <div key={label} className={`stat-card stat-${label}`}>
            <p className="stat-number">{statCounts[label] || 0}</p>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by company or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="action-bar">
        <button className="add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Application
        </button>
        <button className="export-btn" onClick={exportCSV}>⬇ CSV</button>
        <button className="export-btn" onClick={exportPDF}>⬇ PDF</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editingApp ? 'Edit Application' : 'New Application'}</h3>
            <form className="app-form" onSubmit={handleSubmit}>
              <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              <input type="text" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} required />
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Job Link (optional)" value={jobLink} onChange={(e) => setJobLink(e.target.value)} />
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              <label className="file-label">
                Resume (PDF/DOC, optional)
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </label>
              {editingApp?.resumeName && !resumeFile && (
                <p className="current-file-note">Current file: {editingApp.resumeName}</p>
              )}

              {showDuplicateWarning && (
                <div className="duplicate-warning">
                  ⚠️ You already have an application for <strong>{role}</strong> at <strong>{company}</strong>.
                  <button
                    type="button"
                    className="duplicate-confirm-btn"
                    onClick={() => { setConfirmDuplicate(true); setShowDuplicateWarning(false); }}
                  >
                    Add anyway
                  </button>
                </div>
              )}

              <div className="app-form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-save" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingApp ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="kanban-board">
        {STATUSES.map((col) => {
          const colApps = visibleApplications.filter((a) => a.status === col);
          return (
            <div
              key={col}
              className={`kanban-column ${dragOverCol === col ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className={`kanban-column-header col-${col}`}>
                <h4>{col}</h4>
                <span className="count-badge">{colApps.length}</span>
              </div>
              {colApps.length === 0 && <p className="empty-column">Drop here</p>}
              {colApps.map((app) => (
                <div key={app._id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, app._id)}>
                  <h5>{app.role}</h5>
                  <p className="company-name">{app.company}</p>
                  {app.followUpDate && (
                    <p className="follow-up-badge">📅 Follow up: {new Date(app.followUpDate).toLocaleDateString()}</p>
                  )}
                  {app.notes && <p className="card-notes">{app.notes}</p>}
                  <div className="card-links">
                    {app.jobLink && <a href={app.jobLink} target="_blank" rel="noreferrer">View posting →</a>}
                    {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noreferrer">📄 Resume</a>}
                  </div>
                  <div className="kanban-card-footer">
                    <select className="status-select" value={app.status} onChange={(e) => handleStatusChange(app, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="card-icon-btns">
                      <button className="icon-btn" onClick={() => setPrepApp(app)}>Prep</button>
                      <button className="icon-btn" onClick={() => handleEdit(app)}>Edit</button>
                      <button className="icon-btn delete" onClick={() => handleDelete(app._id)}>Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {prepApp && (
        <PrepNotesModal
          application={prepApp}
          onClose={() => setPrepApp(null)}
          onUpdate={handlePrepUpdate}
        />
      )}
    </div>
  );
}

export default Dashboard;