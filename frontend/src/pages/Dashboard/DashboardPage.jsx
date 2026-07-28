import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReport, fetchAdminSummary, fetchAdminRemainingProducts } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import './DashboardPage.css';

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function fmtBRL(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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
   Admin Dashboard
   ───────────────────────────────────────────── */
const STATUS_LABEL_ADM = { disponivel: 'Disponível', reservada: 'Reservado', vendida: 'Vendido' };

function AdminDashboard() {
  const navigate  = useNavigate();

  // ── Resumo ──
  const [summary, setSummary] = useState(null);
  const [loadSum, setLoadSum] = useState(true);
  const [errorSum, setErrorSum] = useState('');

  // ── Produtos ──
  const [allProducts, setAllProducts] = useState([]);
  const [loadProd, setLoadProd] = useState(true);

  // ── Filtros ──
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Paginação ──
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchAdminSummary()
      .then(setSummary)
      .catch(() => setErrorSum('Não foi possível carregar o resumo.'))
      .finally(() => setLoadSum(false));
  }, []);

  useEffect(() => {
    fetchAdminRemainingProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoadProd(false));
  }, []);

  // Filtro client-side
  const filtered = (() => {
    let r = allProducts;
    if (statusFilter) r = r.filter(p => p.status === statusFilter);
    if (search.trim()) {
      const t = search.trim().toLowerCase();
      r = r.filter(p =>
        p.product_name.toLowerCase().includes(t) ||
        (p.product_code || '').toLowerCase().includes(t) ||
        p.seller_name.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t)
      );
    }
    return r;
  })();

  // Reset para pag 1 ao filtrar
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // Contagens por status
  const counts = {
    total:      allProducts.length,
    disponivel: allProducts.filter(p => p.status === 'disponivel').length,
    reservada:  allProducts.filter(p => p.status === 'reservada').length,
    vendida:    allProducts.filter(p => p.status === 'vendida').length,
  };

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const startIdx   = (page - 1) * perPage;
  const paginated  = filtered.slice(startIdx, startIdx + perPage);

  const pageNums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNums.push(i);
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  function sellerInitials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  return (
    <main className="db-page">

      <PageHero title="Dashboard" subtitle="Visão geral do bazar e gestão de produtos" />

      <div className="db-body">

        {/* ── Cards de resumo ── */}
        {errorSum && (
          <div className="db-error-state">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>{errorSum}</p>
          </div>
        )}

        {loadSum && (
          <div className="db-sk-row db-sk-row--5">
            {[...Array(5)].map((_, i) => <div key={i} className="db-sk db-sk--card" />)}
          </div>
        )}

        {!loadSum && summary && (
          <div className="db-stat-grid db-stat-grid--5">
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
                <span className="db-stat-value">{summary.total_products}</span>
                <span className="db-stat-label">Total de produtos</span>
              </div>
            </div>
            <div className="db-stat-card db-stat--green">
              <div className="db-stat-icon">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="db-stat-body">
                <span className="db-stat-value">{summary.remaining_products}</span>
                <span className="db-stat-label">Ativos no bazar</span>
              </div>
            </div>
            <div className="db-stat-card db-stat--indigo">
              <div className="db-stat-icon">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M3 4h2l1.5 7h8l1.5-5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="14" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="db-stat-body">
                <span className="db-stat-value">{summary.sold_products}</span>
                <span className="db-stat-label">Vendidos</span>
              </div>
            </div>
            <div className="db-stat-card db-stat--blue2">
              <div className="db-stat-icon">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M10 2v16M5 6l5-4 5 4M5 14l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="db-stat-body">
                <span className="db-stat-value db-stat-value--sm">{fmtBRL(summary.total_sales_value)}</span>
                <span className="db-stat-label">Total arrecadado</span>
              </div>
            </div>
            <div className="db-stat-card db-stat--rose">
              <div className="db-stat-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
              </div>
              <div className="db-stat-body">
                <span className="db-stat-value db-stat-value--sm">{fmtBRL(summary.total_expected_donation)}</span>
                <span className="db-stat-label">Contribuição social</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Painel de gestão de produtos ── */}
        <div className="adm-panel">

          {/* Header do painel */}
          <div className="adm-header">
            <div className="adm-header-brand">
              <div className="adm-header-bars">
                <span /><span /><span /><span />
              </div>
              <div>
                <h2 className="adm-panel-title">Gestão de Produtos</h2>
                <p className="adm-panel-sub">
                  {loadProd
                    ? 'Carregando...'
                    : `${filtered.length} produto${filtered.length !== 1 ? 's' : ''}${(search || statusFilter) ? ' encontrado(s)' : ' cadastrado(s)'}`
                  }
                </p>
              </div>
            </div>

            {/* Busca universal */}
            <div className="adm-search">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, código, vendedor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="adm-search-clear" onClick={() => setSearch('')} aria-label="Limpar">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filtros de status — chips */}
          <div className="adm-filters">
            {[
              { key: '',           label: 'Todos',      count: counts.total,      color: '#0041D9' },
              { key: 'disponivel', label: 'Disponível', count: counts.disponivel, color: '#059669' },
              { key: 'reservada',  label: 'Reservado',  count: counts.reservada,  color: '#D97706' },
              { key: 'vendida',    label: 'Vendido',    count: counts.vendida,    color: '#4338CA' },
            ].map(f => (
              <button
                key={f.key}
                className={`adm-chip adm-chip--${f.key || 'all'} ${statusFilter === f.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
                style={{ '--chip-color': f.color }}
              >
                {f.key && <span className="adm-chip-dot" />}
                {f.label}
                <span className="adm-chip-badge">{f.count}</span>
              </button>
            ))}
          </div>

          {/* Tabela */}
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Vendedor</th>
                  <th>Preço</th>
                  <th>Valor final</th>
                  <th>Status</th>
                  <th>Cadastrado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loadProd ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="adm-sk-row">
                      {[44, 200, 130, 70, 70, 80, 70, 28].map((w, j) => (
                        <td key={j}><div className="adm-cell-sk" style={{ width: w }} /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="adm-empty">
                        <div className="adm-empty-icon">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <p className="adm-empty-title">Nenhum produto encontrado</p>
                        <p className="adm-empty-sub">
                          {search ? `Sem resultados para "${search}"` : 'Tente ajustar os filtros'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map(p => (
                    <tr
                      key={p.product_id}
                      className="adm-row"
                      onClick={() => navigate(`/products/${p.product_id}`)}
                    >
                      <td>
                        <span className="adm-cell-code">{p.product_code || '—'}</span>
                      </td>
                      <td>
                        <div className="adm-product-cell">
                          <span className="adm-product-name">{p.product_name}</span>
                          <div className="adm-product-sub">
                            <span className="adm-product-cat">{p.category}</span>
                            {p.has_offers && (
                              <span
                                className="adm-offer-badge"
                                title={`${p.offers_count} oferta(s) recebida(s)`}
                              >
                                <svg viewBox="0 0 20 20" fill="none">
                                  <path d="M3 5l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                  <rect x="3" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                {p.offers_count} oferta{p.offers_count !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="adm-cell-seller">
                          <span className="adm-seller-avatar">{sellerInitials(p.seller_name)}</span>
                          <span className="adm-seller-name">{p.seller_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="adm-cell-price">
                          {Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td>
                        {p.final_value != null ? (
                          <span className="adm-cell-final" title={p.status === 'vendida' ? 'Valor da venda' : 'Valor negociado'}>
                            {Number(p.final_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        ) : (
                          <span className="adm-cell-final adm-cell-final--empty">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge--${p.status}`}>
                          <span className="adm-badge-dot" />
                          {STATUS_LABEL_ADM[p.status] || p.status}
                        </span>
                      </td>
                      <td>
                        <span className="adm-cell-date">{fmtDate(p.created_at)}</span>
                      </td>
                      <td>
                        <button
                          className="adm-row-action"
                          onClick={e => { e.stopPropagation(); navigate(`/products/${p.product_id}`); }}
                          title="Ver produto"
                        >
                          <svg viewBox="0 0 20 20" fill="none">
                            <path d="M2 10s2.5-5 8-5 8 5 8 5-2.5 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {!loadProd && filtered.length > 0 && (
            <div className="adm-pagination">
              <div className="adm-per-page">
                <span>Linhas por página</span>
                <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="adm-pagination-center">
                <button className="adm-page-arrow" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <svg viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                {page > 3 && (
                  <><button className="adm-page-num" onClick={() => setPage(1)}>1</button>
                  <span className="adm-page-dots">···</span></>
                )}
                {pageNums.map(n => (
                  <button
                    key={n}
                    className={`adm-page-num ${n === page ? 'active' : ''}`}
                    onClick={() => setPage(n)}
                  >{n}</button>
                ))}
                {page < totalPages - 2 && (
                  <><span className="adm-page-dots">···</span>
                  <button className="adm-page-num" onClick={() => setPage(totalPages)}>{totalPages}</button></>
                )}

                <button className="adm-page-arrow" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  <svg viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <span className="adm-page-info">
                {startIdx + 1}–{Math.min(startIdx + perPage, filtered.length)} de {filtered.length}
              </span>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate  = useNavigate();
  const user      = JSON.parse(sessionStorage.getItem('user') || '{}');

  if (user.role === 'admin') return <AdminDashboard />;

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

      <PageHero title="Dashboard" subtitle="Acompanhe seus produtos e resultados no bazar" />

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
