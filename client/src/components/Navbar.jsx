import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">Job Tracker</span>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}>
          Board
        </Link>
        <Link to="/jobs" className={location.pathname === '/jobs' ? 'nav-link active' : 'nav-link'}>
          Jobs
        </Link>
        <Link to="/calendar" className={location.pathname === '/calendar' ? 'nav-link active' : 'nav-link'}>
          Calendar
        </Link>
        <Link to="/analytics" className={location.pathname === '/analytics' ? 'nav-link active' : 'nav-link'}>
          Analytics
        </Link>
        <Link to="/profile" className={location.pathname === '/profile' ? 'nav-link active' : 'nav-link'}>
          Profile
        </Link>
      </div>
      <div className="navbar-right">
        <span className="welcome-text-inline">Hi, {user?.name}</span>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;