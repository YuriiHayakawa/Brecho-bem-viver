import Navbar from '../../components/Navbar/Navbar';
import './DashboardPage.css';

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="dashboard-page">

        <div className="dashboard-hero">
          <div className="dashboard-hero-diagonal" />
          <div className="dashboard-hero-inner">
            <div className="dashboard-hero-bars">
              <span /><span /><span /><span />
            </div>
            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">Visão geral e métricas do bazar</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-coming-soon">
            <div className="coming-soon-bars">
              <span /><span /><span /><span />
            </div>
            <div className="coming-soon-badge">Em breve</div>
            <h2>Esta página está em desenvolvimento</h2>
            <p>
              O painel de controle vai trazer métricas, gráficos de vendas,
              produtos mais reservados e muito mais.
            </p>
            <div className="coming-soon-features">
              <div className="cs-feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 16l4-4 4 4 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Gráfico de vendas</span>
              </div>
              <div className="cs-feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Relatório de produtos</span>
              </div>
              <div className="cs-feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Top vendedores</span>
              </div>
              <div className="cs-feature">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L16 7H13V17H16L12 21L8 17H11V7H8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span>Total arrecadado via PIX</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
