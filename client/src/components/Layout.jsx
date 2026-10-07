import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Tasks', path: '/tasks', icon: '✅' },
  { label: 'Subjects', path: '/subjects', icon: '📚' },
  { label: 'Expenses', path: '/expenses', icon: '💰' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'menu-open' : ''}`}>
        <div className="mobile-sidebar-header">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="sidebar-brand">StudyTrack</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
          <button type="button" className="nav-link logout-button" onClick={handleLogout}>
            <span>🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        <div className="user-badge">
          <strong>{user?.name || 'Student'}</strong>
          <small>{user?.email || ''}</small>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
      {menuOpen ? <button type="button" className="menu-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} /> : null}
    </div>
  );
}
