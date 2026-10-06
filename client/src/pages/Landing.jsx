import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <span className="navbar-brand">Job Tracker</span>
        <div>
          <Link to="/login" className="landing-nav-link">Login</Link>
          <Link to="/signup" className="landing-nav-btn">Sign Up</Link>
        </div>
      </nav>

      <div className="landing-hero">
        <h1>Track your job search.<br />Stop losing track of applications.</h1>
        <p>
          A simple Kanban board to organize every application, follow-up date,
          resume, and interview — all in one place.
        </p>
        <div className="landing-cta">
          <Link to="/signup" className="landing-primary-btn">Get Started Free</Link>
          <Link to="/login" className="landing-secondary-btn">I already have an account</Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="landing-feature-card">
          <h3>📋 Kanban Board</h3>
          <p>Drag and drop applications between Applied, Interview, Offer, and Rejected.</p>
        </div>
        <div className="landing-feature-card">
          <h3>📊 Analytics</h3>
          <p>See your progress with charts — status breakdown and applications over time.</p>
        </div>
        <div className="landing-feature-card">
          <h3>📄 Resume Storage</h3>
          <p>Attach the exact resume you sent for each application, so you never lose track.</p>
        </div>
        <div className="landing-feature-card">
          <h3>🔔 Follow-up Reminders</h3>
          <p>Set follow-up dates and never miss checking back on an application.</p>
        </div>
      </div>

      <footer className="landing-footer">
        <p>Built with the MERN stack.</p>
      </footer>
    </div>
  );
}

export default Landing;