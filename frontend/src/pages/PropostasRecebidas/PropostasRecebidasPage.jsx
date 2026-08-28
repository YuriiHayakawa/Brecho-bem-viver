import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { fetchReceivedOffers, acceptOffer, rejectOffer, counterOffer } from '../../services/api';
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
  { key: 'pending',   label: 'Pendentes'      },
  { key: '',          label: 'Todas'          },
  { key: 'countered', label: 'Contrapropostas' },
  { key: 'accepted',  label: 'Aceitas'        },
  { key: 'rejected',  label: 'Recusadas'      },
];

function fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─────────────────────────────────────────────
// Modal de Contraproposta
// ─────────────────────────────────────────────
function CounterOfferModal({ offer, onClose, onSuccess }) {
  const [counterPrice, setCounterPrice] = useState('');
  const [message, setMessage]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const p = offer.product || {};
  const originalPrice = Number(offer.original_price);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const value = parseFloat(counterPrice);
    if (!(value > 0)) {
      setError('Informe um valor válido para a contraproposta.');
      return;
    }
    if (value >= originalPrice) {
      setError('A contraproposta deve ser menor que o valor anunciado.');
      return;
    }

    setLoading(true);
    try {
      const updated = await counterOffer(offer.id, {
        counter_price: value,
        message: message.trim() || undefined,
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sale-overlay" onClick={onClose}>
      <div className="sale-modal" onClick={e => e.stopPropagation()}>

        <div className="sale-modal-header">
          <div className="sale-modal-title-group">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Enviar contraproposta</span>
          </div>
          <button className="label-modal-close" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="sale-product-info">
          {p.code && <span className="sale-product-code">{p.code}</span>}
          <span className="sale-product-name">{p.name}</span>
        </div>

        <form className="sale-form" onSubmit={handleSubmit}>

          <div className="sale-field">
            <label>Anunciado</label>
            <input
              type="text"
              value={fmtBRL(originalPrice)}
              disabled
              style={{ background: '#F3F4F6', color: '#6B7280' }}
            />
          </div>

          <div className="sale-field">
            <label>Oferta do comprador</label>
            <input
              type="text"
              value={fmtBRL(offer.offered_price)}
              disabled
              style={{ background: '#F3F4F6', color: '#6B7280' }}
            />
          </div>

          <div className="sale-field">
            <label htmlFor="cf-price">Sua contraproposta (R$) <span>*</span></label>
            <input
              id="cf-price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              value={counterPrice}
              onChange={e => setCounterPrice(e.target.value)}
            />
          </div>

          <div className="sale-field">
            <label htmlFor="cf-msg">Mensagem <span className="optional">(opcional)</span></label>
            <textarea
              id="cf-msg"
              rows={3}
              placeholder="Ex.: Consigo esse valor à vista na entrega."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical', width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
            />
          </div>

          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
            Essa contraproposta é definitiva: o comprador só poderá aceitá-la ou recusá-la.
          </p>

          {error && (
            <p className="sale-error">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </p>
          )}

          <div className="sale-actions">
            <button type="button" className="sale-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="sale-btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15"/>
                  </svg>
                  Enviando...
                </>
              ) : 'Enviar contraproposta'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function PropostasRecebidasPage() {
  const navigate  = useNavigate();
  const showToast = useToast();

  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('pending');
  const [busyId, setBusyId]   = useState(null);
  const [counterTarget, setCounterTarget] = useState(null); // oferta sendo contraproposta

  useEffect(() => {
    fetchReceivedOffers()
      .then(setOffers)
      .catch(() => setError('Não foi possível carregar as propostas recebidas.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept(offer) {
    setBusyId(offer.id);
    try {
      const updated = await acceptOffer(offer.id);
      // Aceitar uma reserva o produto; outras propostas pendentes/contrapropostas do mesmo produto passam a recusadas
      setOffers(prev => prev.map(o => {
        if (o.id === updated.id) return { ...o, ...updated };
        if (o.product_id === updated.product_id && (o.status === 'pending' || o.status === 'countered')) {
          return { ...o, status: 'rejected' };
        }
        return o;
      }));
      showToast('Proposta aceita! O produto foi reservado para o comprador.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(offer) {
    setBusyId(offer.id);
    try {
      const updated = await rejectOffer(offer.id);
      setOffers(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
      showToast('Proposta recusada.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  function handleCounterSuccess(updated) {
    setOffers(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
    showToast('Contraproposta enviada ao comprador!');
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
      <PageHero title="Propostas Recebidas" subtitle="Aceite, recuse ou contraproponha ofertas nos seus produtos" />

      {counterTarget && (
        <CounterOfferModal
          offer={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSuccess={handleCounterSuccess}
        />
      )}

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
            <p className="off-empty-title">Nenhuma proposta recebida</p>
            <p className="off-empty-sub">Quando alguém fizer uma oferta nos seus produtos, ela aparecerá aqui.</p>
          </div>
        )}

        {!loading && !error && offers.length > 0 && filtered.length === 0 && (
          <div className="off-empty">
            <p className="off-empty-title">Nenhuma proposta neste filtro</p>
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
                        {offer.buyer && (
                          <p className="off-card-person">
                            De: <strong>{offer.buyer.name}</strong>
                            {offer.buyer.phone ? ` · ${offer.buyer.phone}` : ''}
                          </p>
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
                        <span className="off-price-lbl">Oferta</span>
                        <span className="off-price-new">{fmtBRL(offer.offered_price)}</span>
                      </div>
                      {offer.counter_price != null && (
                        <>
                          <span className="off-price-arrow">
                            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                          <div className="off-price-item">
                            <span className="off-price-lbl">Sua contraproposta</span>
                            <span className="off-price-new" style={{ color: '#2563EB' }}>{fmtBRL(offer.counter_price)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {offer.message && <p className="off-card-msg">"{offer.message}"</p>}

                    {offer.status === 'countered' && (
                      <div className="off-countered-banner">
                        <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Aguardando o comprador aceitar ou recusar sua contraproposta.
                        {offer.counter_message && <span className="off-countered-msg">"{offer.counter_message}"</span>}
                      </div>
                    )}

                    {offer.status === 'rejected' && offer.counter_price != null && (
                      <div className="off-countered-banner off-countered-banner--rejected">
                        <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        Sua contraproposta de {fmtBRL(offer.counter_price)} não foi aceita.
                      </div>
                    )}

                    {offer.status === 'accepted' && offer.counter_price != null && (
                      <div className="off-countered-banner off-countered-banner--accepted">
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                        O comprador aceitou sua contraproposta de {fmtBRL(offer.counter_price)} — produto reservado.
                      </div>
                    )}

                    <div className="off-card-foot">
                      <span className="off-card-date">Recebida em {fmtDate(offer.created_at)}</span>
                      {offer.status === 'pending' && (
                        <div className="off-actions">
                          <button className="off-btn off-btn--reject" disabled={busy} onClick={() => handleReject(offer)}>
                            <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            Recusar
                          </button>
                          <button className="off-btn off-btn--counter" disabled={busy} onClick={() => setCounterTarget(offer)}>
                            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Contraproposta
                          </button>
                          <button className="off-btn off-btn--accept" disabled={busy} onClick={() => handleAccept(offer)}>
                            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {busy ? 'Processando...' : 'Aceitar'}
                          </button>
                        </div>
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
