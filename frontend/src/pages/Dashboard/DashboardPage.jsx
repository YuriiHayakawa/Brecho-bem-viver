import { useEffect, useState } from 'react';
import { fetchMyReport } from '../../services/api';
import './DashboardPage.css';

/* ─────────────────────────────────────────────
   Gráfico de barras — CSS puro, sem biblioteca
   ───────────────────────────────────────────── */
function BarChart({ report }) {
  const bars = [
    { label: 'Total',    value: report.total_products,     color: 'var(--bar-blue)',   bg: 'var(--bar-blue-bg)'   },
    { label: 'Ativos',   value: report.remaining_products, color: 'var(--bar-green)',  bg: 'var(--bar-green-bg)'  },
    { label: 'Vendidos', value: report.sold_products,      color: 'var(--bar-gray)',   bg: 'var(--bar-gray-bg)'   },
  ];

  const max = Math.max(report.total_products, 1); // evita divisão por zero

  return (
    <div className="db-card db-chart-card">
      <div className="db-card-header">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="7"  y="10" width="3" height="8" rx="1" fill="currentColor" opacity="0.7"/>
          <rect x="13" y="6"  width="3" height="12" rx="1" fill="currentColor" opacity="0.5"/>
          <rect x="19" y="13" width="3" height="5" rx="1" fill="currentColor" opacity="0.4"/>
        </svg>
        <h3>Seus produtos</h3>
      </div>

      <div className="db-chart-area">
        {bars.map(bar => (
          <div key={bar.label} className="db-bar-col">
            {/* Valor acima da barra */}
            <span className="db-bar-value" style={{ color: bar.color }}>
              {bar.value}
            </span>

            {/* Track + barra animada */}
            <div className="db-bar-track">
              <div
                className="db-bar-fill"
                style={{
                  height: `${(bar.value / max) * 100}%`,
                  background: bar.color,
                }}
              />
            </div>

            {/* Pill colorida + label */}
            <div className="db-bar-pill" style={{ background: bar.bg, color: bar.color }}>
              {bar.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function fmtBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const firstName = user.name?.split(' ')[0] || 'Usuário';

  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchMyReport()
      .then(setReport)
      .catch(() => setError('Não foi possível carregar o painel.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Derivações ── */
  const soldPct = report && report.total_products > 0
    ? Math.round((report.sold_products / report.total_products) * 100)
    : 0;

  return (
    <main className="db-page">

      {/* ── Hero ── */}
      <div className="db-hero">
        <div className="db-hero-diagonal" />
        <div className="db-hero-inner">
          <div className="db-hero-bars">
            <span /><span /><span /><span />
          </div>
          <div className="db-hero-text">
            <p className="db-greeting">{greeting()},</p>
            <h1 className="db-hero-title">{firstName}!</h1>
            <p className="db-hero-sub">Aqui está o resumo dos seus produtos no bazar</p>
          </div>
        </div>
      </div>

      <div className="db-content">

        {/* ── Loading ── */}
        {loading && (
          <div className="db-skeleton-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="db-skeleton" />)}
          </div>
        )}

        {/* ── Erro ── */}
        {error && (
          <div className="db-error">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* ── Dados ── */}
        {!loading && !error && report && (
          <>
            {/* ── Estado vazio ── */}
            {report.total_products === 0 && (
              <div className="db-empty">
                <div className="db-empty-bars">
                  <span /><span /><span />
                </div>
                <h2>Você ainda não tem produtos cadastrados</h2>
                <p>Cadastre seu primeiro produto e comece a vender no bazar.</p>
                <button className="db-btn-primary" onClick={() => navigate('/novo-produto')}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd"/>
                  </svg>
                  Cadastrar primeiro produto
                </button>
              </div>
            )}

            {/* ── Métricas ── */}
            {report.total_products > 0 && (
              <>
                {/* Cards principais */}
                <div className="db-stats-grid">

                  <div className="db-stat-card db-stat--blue">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value">{report.total_products}</span>
                      <span className="db-stat-label">Total de anúncios</span>
                    </div>
                  </div>

                  <div className="db-stat-card db-stat--green">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value">{report.remaining_products}</span>
                      <span className="db-stat-label">Ativos no bazar</span>
                    </div>
                  </div>

                  <div className="db-stat-card db-stat--gray">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value">{report.sold_products}</span>
                      <span className="db-stat-label">Vendidos</span>
                    </div>
                  </div>

                  <div className="db-stat-card db-stat--indigo">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 3L16 7H13V17H16L12 21L8 17H11V7H8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value db-stat-value--sm">{fmtBRL(report.total_sales_value)}</span>
                      <span className="db-stat-label">Total arrecadado</span>
                    </div>
                  </div>

                </div>

                {/* Progresso + Doação */}
                <div className="db-secondary-grid">

                  {/* Progresso de vendas */}
                  <div className="db-card">
                    <div className="db-card-header">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M7 16l4-5 4 3 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3>Progresso de vendas</h3>
                    </div>
                    <div className="db-progress-wrap">
                      <div className="db-progress-labels">
                        <span>{report.sold_products} vendido{report.sold_products !== 1 ? 's' : ''}</span>
                        <span className="db-progress-pct">{soldPct}%</span>
                      </div>
                      <div className="db-progress-track">
                        <div className="db-progress-bar" style={{ width: `${soldPct}%` }} />
                      </div>
                      <div className="db-progress-legend">
                        <span className="db-legend-dot db-legend-dot--green" />
                        <span>{report.remaining_products} ativo{report.remaining_products !== 1 ? 's' : ''}</span>
                        <span className="db-legend-dot db-legend-dot--gray" />
                        <span>{report.sold_products} vendido{report.sold_products !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doação esperada */}
                  <div className="db-card db-card--donation">
                    <div className="db-card-header">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <h3>Contribuição social</h3>
                    </div>
                    <div className="db-donation-body">
                      <p className="db-donation-value">{fmtBRL(report.total_expected_donation)}</p>
                      <p className="db-donation-label">doação esperada com suas vendas</p>
                      <p className="db-donation-desc">
                        Parte do valor de cada venda é destinada como doação,
                        gerando impacto positivo na comunidade.
                      </p>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ── Gráfico de barras ── */}
            <BarChart report={report} />

          </>
        )}
      </div>
    </main>
  );
}
