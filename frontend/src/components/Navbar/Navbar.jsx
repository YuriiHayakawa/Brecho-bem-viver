import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_ITEMS = [
  {
    key: 'perfil',
    label: 'Perfil',
    path: '/perfil',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: 'catalogo',
    label: 'Catálogo',
    path: '/catalogo',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h14M3 15h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: 'orientacoes',
    label: 'Orientações',
    path: '/orientacoes',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 2v12M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'sobre',
    label: 'Sobre',
    path: '/sobre',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9v5M10 7v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  function handleLogout() {
    sessionStorage.removeItem('user');
    navigate('/login');
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <button className="navbar-logo" onClick={() => navigate('/dashboard')}>
          <div className="navbar-bars">
            <span className="nb bar-1" />
            <span className="nb bar-2" />
            <span className="nb bar-3" />
            <span className="nb bar-4" />
          </div>
          <div className="navbar-brand">
            <span className="navbar-sebrae">SEBRAE</span>
            <span className="navbar-bazar">Bazar</span>
          </div>
        </button>

        {/* Nav central */}
        <ul className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.key} className="nav-item">
              <button
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <span className="nav-indicator" />
              </button>
            </li>
          ))}
        </ul>

        {/* Usuário + logout */}
        <div className="navbar-user">
          <button
            className="navbar-user-info"
            onClick={() => navigate('/perfil')}
            title="Ver perfil"
          >
            <div className="navbar-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="navbar-user-name">{user.name?.split(' ')[0] || 'Usuário'}</span>
          </button>

          <button className="navbar-logout" onClick={handleLogout} title="Sair">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 14l3-4-3-4M16 10H7"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Sair</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
