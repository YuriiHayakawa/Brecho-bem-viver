import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { fetchReceivedOffers, acceptOffer, rejectOffer } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import '../offers.css';

const STATUS = {
  pending:   { label: 'Pendente',  cls: 'pending'   },
  accepted:  { label: 'Aceita',    cls: 'accepted'  },
  rejected:  { label: 'Recusada',  cls: 'rejected'  },
  cancelled: { label: 'Cancelada', cls: 'cancelled' },
};

const FILTERS = [
  { key: 'pending',  label: 'Pendentes' },
  { key: '',         label: 'Todas'     },
  { key: 'accepted', label: 'Aceitas'   },
  { key: 'rejected', label: 'Recusadas' },
];

function fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PropostasRecebidasPage() {
  const navigate  = useNavigate();
  const showToast = useToast();

  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('pending');
  const [busyId, setBusyId]   = useState(null);

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
      // Aceitar uma reserva o produto; outras propostas pendentes do mesmo produto passam a recusadas
      setOffers(prev => prev.map(o => {
        if (o.id === updated.id) return { ...o, ...updated };
        if (o.product_id === updated.product_id && o.status === 'pending') {
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

  const counts = {
    total:    offers.length,
    pending:  offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  };

  const filtered = filter ? offers.filter(o => o.status === filter) : offers;

  return (
    <div className="off-page">
      <PageHero title="Propostas Recebidas" subtitle="Aceite ou recuse ofertas nos seus produtos" />

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
                    </div>

                    {offer.message && <p className="off-card-msg">"{offer.message}"</p>}

                    <div className="off-card-foot">
                      <span className="off-card-date">Recebida em {fmtDate(offer.created_at)}</span>
                      {offer.status === 'pending' && (
                        <div className="off-actions">
                          <button className="off-btn off-btn--reject" disabled={busy} onClick={() => handleReject(offer)}>
                            <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            Recusar
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
