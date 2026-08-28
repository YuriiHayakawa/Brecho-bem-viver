import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { fetchSentOffers, acceptCounterOffer, rejectCounterOffer } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import '../offers.css';

const STATUS = {
  pending:   { label: 'Pendente',       cls: 'pending'   },
  countered: { label: 'Contraproposta', cls: 'countered' },
  accepted:  { label: 'Aceita',         cls: 'accepted'  },
  rejected:  { label: 'Recusada',       cls: 'rejected'  },
  cancelled: { label: 'Cancelada',      cls: 'cancelled' },
};

const FILTERS = [
  { key: '',          label: 'Todas'           },
  { key: 'pending',   label: 'Pendentes'       },
  { key: 'countered', label: 'Contrapropostas' },
  { key: 'accepted',  label: 'Aceitas'         },
  { key: 'rejected',  label: 'Recusadas'       },
];

function fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MinhasPropostasPage() {
  const navigate  = useNavigate();
  const showToast = useToast();

  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('');
  const [busyId, setBusyId]   = useState(null);

  useEffect(() => {
    fetchSentOffers()
      .then(setOffers)
      .catch(() => setError('Não foi possível carregar suas propostas.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAcceptCounter(offer) {
    setBusyId(offer.id);
    try {
      const updated = await acceptCounterOffer(offer.id);
      setOffers(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
      showToast('Contraproposta aceita! O produto foi reservado para você.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectCounter(offer) {
    setBusyId(offer.id);
    try {
      const updated = await rejectCounterOffer(offer.id);
      setOffers(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
      showToast('Contraproposta recusada.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    total:     offers.length,
    pending:   offers.filter(o => o.status === 'pending').length,
    countered: offers.filter(o => o.status === 'countered').length,
    accepted:  offers.filter(o => o.status === 'accepted').length,
    rejected:  offers.filter(o => o.status === 'rejected').length,
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
              <div className="off-stat off-stat--blue"><span className="off-stat-val">{counts.countered}</span><span className="off-stat-lbl">Contrapropostas</span></div>
              <div className="off-stat off-stat--green"><span className="off-stat-val">{counts.accepted}</span><span className="off-stat-lbl">Aceitas</span></div>
              <div className="off-stat off-stat--red"><span className="off-stat-val">{counts.rejected}</span><span className="off-stat-lbl">Recusadas</span></div>
            </div>

            <div className="off-filters">
              {FILTERS.map(f => (
                <button
                  key={f.key || 'all'}
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
              const busy = busyId === offer.id;
              const cover = p.images?.find(img => img.is_cover) || p.images?.[0];
              const imgUrl = cover ? cover.image_url : null;
              return (
                <div key={offer.id} className="off-card">
                  {imgUrl
                    ? <img className="off-card-img" src={imgUrl} alt={p.name || 'Produto'} onClick={() => navigate(`/products/${offer.product_id}`)} />
                    : (
                      <div className="off-card-img-ph" onClick={() => navigate(`/products/${offer.product_id}`)}>
                        <span /><span /><span />
                      </div>
                    )
                  }
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
                      {offer.counter_price != null && (
                        <>
                          <span className="off-price-arrow">
                            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                          <div className="off-price-item">
                            <span className="off-price-lbl">Contraproposta do vendedor</span>
                            <span className="off-price-new" style={{ color: '#2563EB' }}>{fmtBRL(offer.counter_price)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {offer.message && <p className="off-card-msg">"{offer.message}"</p>}

                    {offer.status === 'countered' && (
                      <div className="off-countered-banner">
                        <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        O vendedor propôs {fmtBRL(offer.counter_price)}. Essa é a decisão final da negociação.
                        {offer.counter_message && <span className="off-countered-msg">"{offer.counter_message}"</span>}
                      </div>
                    )}

                    {offer.status === 'rejected' && offer.counter_price != null && (
                      <div className="off-countered-banner off-countered-banner--rejected">
                        <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        A contraproposta de {fmtBRL(offer.counter_price)} do vendedor foi recusada.
                      </div>
                    )}

                    {offer.status === 'accepted' && offer.counter_price != null && (
                      <div className="off-countered-banner off-countered-banner--accepted">
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                        Você aceitou a contraproposta de {fmtBRL(offer.counter_price)} — produto reservado para você.
                      </div>
                    )}

                    <div className="off-card-foot">
                      <span className="off-card-date">Enviada em {fmtDate(offer.created_at)}</span>
                      {offer.status === 'countered' && (
                        <div className="off-actions">
                          <button className="off-btn off-btn--reject" disabled={busy} onClick={() => handleRejectCounter(offer)}>
                            <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            Recusar
                          </button>
                          <button className="off-btn off-btn--accept" disabled={busy} onClick={() => handleAcceptCounter(offer)}>
                            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {busy ? 'Processando...' : 'Aceitar contraproposta'}
                          </button>
                        </div>
                      )}
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
