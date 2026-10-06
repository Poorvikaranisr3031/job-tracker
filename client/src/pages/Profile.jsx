import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name });
      updateUser(res.data.user);
      toast.success('Name updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="page-title">Profile Settings</h2>

      <div className="settings-grid">
        <form className="settings-card" onSubmit={handleNameUpdate}>
          <h4>Your Name</h4>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <p className="settings-note">Email: {user.email}</p>
          <button type="submit" className="btn-save">Save Name</button>
        </form>

        <form className="settings-card" onSubmit={handlePasswordUpdate}>
          <h4>Change Password</h4>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="btn-save">Update Password</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;