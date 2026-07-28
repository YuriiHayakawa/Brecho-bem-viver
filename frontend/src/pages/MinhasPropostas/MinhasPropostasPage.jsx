import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSentOffers } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import '../offers.css';

const STATUS = {
  pending:   { label: 'Pendente',  cls: 'pending'   },
  accepted:  { label: 'Aceita',    cls: 'accepted'  },
  rejected:  { label: 'Recusada',  cls: 'rejected'  },
  cancelled: { label: 'Cancelada', cls: 'cancelled' },
};

const FILTERS = [
  { key: '',         label: 'Todas'     },
  { key: 'pending',  label: 'Pendentes' },
  { key: 'accepted', label: 'Aceitas'   },
  { key: 'rejected', label: 'Recusadas' },
];

function fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MinhasPropostasPage() {
  const navigate = useNavigate();

  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    fetchSentOffers()
      .then(setOffers)
      .catch(() => setError('Não foi possível carregar suas propostas.'))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:    offers.length,
    pending:  offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  };

  const filtered = filter ? offers.filter(o => o.status === filter) : offers;

  return (
    <div className="off-page">
      <PageHero title="Minhas Propostas" subtitle="Acompanhe as ofertas que você enviou" />

      <div className="off-content">

        {!loading && !error && offers.length > 0 && (
          <>
            <div className="off-stats">
              <div className="off-stat"><span className="off-stat-val">{counts.total}</span><span className="off-stat-lbl">Total</span></div>
              <div className="off-stat off-stat--yellow"><span className="off-stat-val">{counts.pending}</span><span className="off-stat-lbl">Pendentes</span></div>
              <div className="off-stat off-stat--green"><span className="off-stat-val">{counts.accepted}</span><span className="off-stat-lbl">Aceitas</span></div>
              <div className="off-stat off-stat--red"><span className="off-stat-val">{counts.rejected}</span><span className="off-stat-lbl">Recusadas</span></div>
            </div>

            <div className="off-filters">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`off-chip ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  <span className="off-chip-badge">{f.key ? counts[f.key] : counts.total}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="off-list">
            {[...Array(3)].map((_, i) => <div key={i} className="off-skeleton" />)}
          </div>
        )}

        {error && (
          <div className="off-empty">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <p className="off-empty-title">{error}</p>
          </div>
        )}

        {!loading && !error && offers.length === 0 && (
          <div className="off-empty">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5-9 5-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 8v8l9 5 9-5V8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            <p className="off-empty-title">Nenhuma proposta enviada</p>
            <p className="off-empty-sub">Faça uma oferta em um produto do catálogo para negociar o valor.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="off-list">
            {filtered.map(offer => {
              const p = offer.product || {};
              const st = STATUS[offer.status] || STATUS.pending;
              return (
                <div key={offer.id} className="off-card">
                  <div className="off-card-img-ph" onClick={() => navigate(`/products/${offer.product_id}`)}>
                    <span /><span /><span />
                  </div>
                  <div className="off-card-body">
                    <div className="off-card-top">
                      <div>
                        <div className="off-card-meta">
                          {p.code && <span className="off-card-code">{p.code}</span>}
                        </div>
                        <div className="off-card-name" onClick={() => navigate(`/products/${offer.product_id}`)}>
                          {p.name || 'Produto'}
                        </div>
                        {offer.seller && (
                          <p className="off-card-person">Vendedor: <strong>{offer.seller.name}</strong></p>
                        )}
                      </div>
                      <span className={`off-badge off-badge--${st.cls}`}>
                        <span className="off-badge-dot" />{st.label}
                      </span>
                    </div>

                    <div className="off-prices">
                      <div className="off-price-item">
                        <span className="off-price-lbl">Anunciado</span>
                        <span className="off-price-old">{fmtBRL(offer.original_price)}</span>
                      </div>
                      <span className="off-price-arrow">
                        <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <div className="off-price-item">
                        <span className="off-price-lbl">Sua oferta</span>
                        <span className="off-price-new">{fmtBRL(offer.offered_price)}</span>
                      </div>
                    </div>

                    {offer.message && <p className="off-card-msg">"{offer.message}"</p>}

                    <div className="off-card-foot">
                      <span className="off-card-date">Enviada em {fmtDate(offer.created_at)}</span>
                      {offer.status === 'accepted' && (
                        <button className="off-btn off-btn--ghost" onClick={() => navigate(`/products/${offer.product_id}`)}>
                          Ver produto reservado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
