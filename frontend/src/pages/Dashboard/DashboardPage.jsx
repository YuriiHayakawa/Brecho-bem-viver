import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReport } from '../../services/api';
import './DashboardPage.css';

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function fmtBRL(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

/* ─────────────────────────────────────────────
   Donut Ring — SVG puro, animado no mount
   ───────────────────────────────────────────── */
function DonutRing({ total, sold, active }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  const R   = 78;
  const SW  = 16;
  const C   = 2 * Math.PI * R;
  const GAP = 4;

  const soldPct   = total > 0 ? sold   / total : 0;
  const activePct = total > 0 ? active / total : 0;

  const soldArc   = Math.max(soldPct   * C - GAP, 0);
  const activeArc = Math.max(activePct * C - GAP, 0);

  const soldOffset   = C / 4;
  const activeOffset = C / 4 - soldPct * C;

  const soldPctLabel   = Math.round(soldPct   * 100);
  const activePctLabel = Math.round(activePct * 100);

  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 180 180" className="ring-svg">
        <circle cx="90" cy="90" r={R} fill="none" stroke="#EAECF0" strokeWidth={SW} />

        {active > 0 && (
          <circle
            cx="90" cy="90" r={R}
            fill="none"
            stroke="#10B981"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${ready ? activeArc : 0} ${C}`}
            strokeDashoffset={activeOffset}
            style={{ transition: 'stroke-dasharray 0.85s cubic-bezier(.4,0,.2,1) .15s' }}
          />
        )}

        {sold > 0 && (
          <circle
            cx="90" cy="90" r={R}
            fill="none"
            stroke="#0041D9"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${ready ? soldArc : 0} ${C}`}
            strokeDashoffset={soldOffset}
            style={{ transition: 'stroke-dasharray 0.85s cubic-bezier(.4,0,.2,1) .35s' }}
          />
        )}

        <text x="90" y="80" textAnchor="middle" fontSize="34" fontWeight="800"
          fill="#111827" fontFamily="Barlow, system-ui, sans-serif">
          {total}
        </text>
        <text x="90" y="99" textAnchor="middle" fontSize="10.5" fontWeight="700"
          fill="#9CA3AF" fontFamily="Barlow, system-ui, sans-serif" letterSpacing="1.2">
          PRODUTOS
        </text>
      </svg>

      <div className="ring-legend">
        <div className="ring-legend-item">
          <span className="ring-dot ring-dot--blue" />
          <div className="ring-legend-body">
            <span className="ring-legend-val">{sold}</span>
            <span className="ring-legend-lbl">Vendidos</span>
          </div>
          <span className="ring-legend-pct">{soldPctLabel}%</span>
        </div>
        <div className="ring-legend-sep" />
        <div className="ring-legend-item">
          <span className="ring-dot ring-dot--green" />
          <div className="ring-legend-body">
            <span className="ring-legend-val">{active}</span>
            <span className="ring-legend-lbl">Ativos</span>
          </div>
          <span className="ring-legend-pct">{activePctLabel}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate  = useNavigate();
  const user      = JSON.parse(sessionStorage.getItem('user') || '{}');
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

  return (
    <main className="db-page">

      {/* ── Hero ── */}
      <div className="db-hero">
        <div className="db-hero-diagonal" />
        <div className="db-hero-inner">
          <div className="db-hero-left">
            <div className="db-hero-bars">
              <span /><span /><span /><span />
            </div>
            <div className="db-hero-text">
              <p className="db-greeting">{greeting()},</p>
              <h1 className="db-hero-title">{firstName}!</h1>
              <p className="db-hero-date">{todayLabel()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Corpo ── */}
      <div className="db-body">

        {/* Loading */}
        {loading && (
          <div className="db-skeletons">
            <div className="db-sk-row db-sk-row--4">
              <div className="db-sk db-sk--card" />
              <div className="db-sk db-sk--card" />
              <div className="db-sk db-sk--card" />
              <div className="db-sk db-sk--card" />
            </div>
            <div className="db-sk-row">
              <div className="db-sk db-sk--main" />
              <div className="db-sk db-sk--side" />
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="db-error-state">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Dados */}
        {!loading && !error && report && (
          <>
            {report.total_products === 0 ? (
              <div className="db-empty">
                <div className="db-empty-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#0041D9" strokeWidth="10"
                      strokeDasharray="60 179" strokeDashoffset="47" strokeLinecap="round" opacity="0.25"/>
                  </svg>
                </div>
                <h2>Nenhum produto ainda</h2>
                <p>Cadastre seu primeiro item e comece a acompanhar seu desempenho aqui.</p>
                <button className="db-cta" onClick={() => navigate('/novo-produto')}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd"/>
                  </svg>
                  Cadastrar primeiro produto
                </button>
              </div>
            ) : (
              <>
                {/* ── Grid de 3 cards ── */}
                <div className="db-stat-grid">

                  {/* Total de anúncios */}
                  <div className="db-stat-card db-stat--blue">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 20 20" fill="none">
                        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value">{report.total_products}</span>
                      <span className="db-stat-label">Total de anúncios</span>
                    </div>
                  </div>

                  {/* Ativos no bazar */}
                  <div className="db-stat-card db-stat--green">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 20 20" fill="none">
                        <path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value">{report.remaining_products}</span>
                      <span className="db-stat-label">Ativos no bazar</span>
                    </div>
                  </div>

                  {/* Vendidos */}
                  <div className="db-stat-card db-stat--indigo">
                    <div className="db-stat-icon">
                      <svg viewBox="0 0 20 20" fill="none">
                        <path d="M3 4h2l1.5 7h8l1.5-5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="14" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div className="db-stat-body">
                      <span className="db-stat-value">{report.sold_products}</span>
                      <span className="db-stat-label">Vendidos</span>
                    </div>
                  </div>

                </div>

                {/* ── Painel principal ── */}
                <div className="db-main-grid">

                  {/* Donut */}
                  <div className="db-panel db-panel--ring">
                    <p className="db-panel-label">Distribuição dos seus produtos</p>
                    <DonutRing
                      total={report.total_products}
                      sold={report.sold_products}
                      active={report.remaining_products}
                    />
                  </div>

                  {/* Coluna direita: Contribuição social + Total arrecadado */}
                  <div className="db-panel-stack">

                    {/* Contribuição social */}
                    <div className="db-panel db-panel--donation">
                      <div className="db-donation-top">
                        <p className="db-panel-label">Contribuição social</p>
                        <span className="db-heart-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                          </svg>
                        </span>
                      </div>
                      <p className="db-big-num db-big-num--rose">{fmtBRL(report.total_expected_donation)}</p>
                      <p className="db-donation-desc">
                        Uma parte do valor de cada venda realizada no Bazar Sebrae é destinada a instituições sociais parceiras.
                        Esse é o total que suas vendas já contribuíram para essa causa.
                      </p>
                    </div>

                    {/* Total arrecadado */}
                    <div className="db-panel db-panel--revenue">
                      <p className="db-panel-label">Total arrecadado</p>
                      <p className="db-big-num">{fmtBRL(report.total_sales_value)}</p>
                      <div className="db-revenue-bar">
                        <div className="db-revenue-fill" />
                      </div>
                      <p className="db-panel-hint">
                        soma de todas as suas vendas realizadas
                      </p>
                    </div>

                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
