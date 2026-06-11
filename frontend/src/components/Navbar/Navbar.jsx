import { useState, useEffect } from 'react';
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
    key: 'meus-produtos',
    label: 'Meus Produtos',
    path: '/meus-produtos',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 4h2l1.5 7h8l1.5-5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.5" />
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

const ADMIN_ITEMS = [
  {
    key: 'gestao-usuarios',
    label: 'Usuários',
    path: '/gestao-usuarios',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 17c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 9l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Navbar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(sessionStorage.getItem('user') || '{}');

  // fecha sidebar mobile ao mudar de rota
  useEffect(() => { onCloseMobile?.(); }, [location.pathname]);

  function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  }

  function go(path) {
    navigate(path);
    onCloseMobile?.();
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

      {/* ── Cabeçalho ── */}
      <div className="sb-head">
        <button className="sb-logo" onClick={() => go('/dashboard')}>
          <div className="sb-bars">
            <span /><span /><span /><span />
          </div>
          <div className="sb-brand">
            <span className="sb-name">SEBRAE</span>
            <span className="sb-sub">Bazar</span>
          </div>
        </button>

        <button className="sb-toggle" onClick={onToggle} title={collapsed ? 'Expandir' : 'Recolher'}>
          <svg viewBox="0 0 20 20" fill="none">
            {collapsed
              ? <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>
      </div>

      {/* ── Separador decorativo ── */}
      <div className="sb-divider">
        <span className="sb-divider-bar d1" />
        <span className="sb-divider-bar d2" />
        <span className="sb-divider-bar d3" />
      </div>

      {/* ── Navegação ── */}
      <nav className="sb-nav">
        <ul>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <li key={item.key}>
                <button
                  className={`sb-item ${active ? 'active' : ''}`}
                  onClick={() => go(item.path)}
                  data-tooltip={item.label}
                >
                  <span className="sb-item-icon">{item.icon}</span>
                  <span className="sb-item-label">{item.label}</span>
                  {active && <span className="sb-item-bar" />}
                </button>
              </li>
            );
          })}
        </ul>

      </nav>

      {/* ── Usuário + Logout ── */}
      <div className="sb-footer">

        {user.role === 'admin' && (
          <div className="sb-admin-section">
            <ul className="sb-admin-list">
              {ADMIN_ITEMS.map(item => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.key}>
                    <button
                      className={`sb-item ${active ? 'active' : ''}`}
                      onClick={() => go(item.path)}
                      data-tooltip={item.label}
                    >
                      <span className="sb-item-icon">{item.icon}</span>
                      <span className="sb-item-label">{item.label}</span>
                      {active && <span className="sb-item-bar" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <button className="sb-user" onClick={() => go('/perfil')} title="Ver perfil">
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user-info">
            <span className="sb-user-name">{user.name?.split(' ')[0] || 'Usuário'}</span>
            <span className="sb-user-role">
              {user.role === 'admin' ? 'Administrador' : user.role === 'vendedor' ? 'Vendedor' : 'Usuário'}
            </span>
          </div>
        </button>

        <button className="sb-logout" onClick={handleLogout} title="Sair">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 14l3-4-3-4M16 10H7"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sb-item-label">Sair</span>
        </button>
      </div>

    </aside>
  );
}
