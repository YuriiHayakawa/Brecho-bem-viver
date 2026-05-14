import { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './Layout.css';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sb-collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha sidebar no mobile ao redimensionar para desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function toggle() {
    setCollapsed(c => {
      localStorage.setItem('sb-collapsed', String(!c));
      return !c;
    });
  }

  return (
    <div className={`layout ${collapsed ? 'sb-collapsed' : 'sb-expanded'}`}>

      {/* Sidebar */}
      <Navbar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="layout-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Top bar mobile */}
      <header className="layout-topbar">
        <button
          className="topbar-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="topbar-brand">
          <div className="topbar-bars">
            <span /><span /><span />
          </div>
          <span className="topbar-name">SEBRAE <em>Bazar</em></span>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="layout-content">
        {children}
      </main>

    </div>
  );
}
