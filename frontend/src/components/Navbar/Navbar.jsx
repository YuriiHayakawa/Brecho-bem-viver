import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  function handleLogout() {
    sessionStorage.removeItem('user');
    navigate('/login');
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

        {/* Usuário + logout */}
        <div className="navbar-user">
          <div className="navbar-user-info">
            <div className="navbar-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="navbar-user-name">{user.name?.split(' ')[0] || 'Usuário'}</span>
          </div>
          <button className="navbar-logout" onClick={handleLogout} title="Sair">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 14l3-4-3-4M16 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
