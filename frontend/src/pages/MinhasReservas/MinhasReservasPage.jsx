import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReservations } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import '../offers.css';

function fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PIX_KEY_TYPE_LABEL = {
  cpf: 'CPF', telefone: 'Telefone', email: 'E-mail', aleatoria: 'Chave Aleatória',
};

// Retorna { text, soon } com o tempo restante até reserved_until
function timeLeft(reservedUntil) {
  if (!reservedUntil) return null;
  const diff = new Date(reservedUntil).getTime() - Date.now();
  if (diff <= 0) return { text: 'Expirando...', soon: true };
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const soon = hours < 3;
  if (hours >= 1) return { text: `${hours}h ${mins}min restantes`, soon };
  return { text: `${mins}min restantes`, soon: true };
}

export default function MinhasReservasPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [, setTick]             = useState(0);

  useEffect(() => {
    fetchMyReservations()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar suas reservas.'))
      .finally(() => setLoading(false));
  }, []);

  // Atualiza os contadores a cada minuto
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="off-page">
      <PageHero title="Minhas Reservas" subtitle="Produtos reservados para você" />

      <div className="off-content">

        {!loading && !error && products.length > 0 && (
          <p className="off-section-title">
            {products.length} produto{products.length !== 1 ? 's' : ''} reservado{products.length !== 1 ? 's' : ''}
          </p>
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

        {!loading && !error && products.length === 0 && (
          <div className="off-empty">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 8h14l-1 11H6L5 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/></svg>
            <p className="off-empty-title">Nenhuma reserva ativa</p>
            <p className="off-empty-sub">Reserve um produto no catálogo ou tenha uma proposta aceita para vê-lo aqui.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="off-list">
            {products.map(product => {
              const cover = product.images?.find(i => i.is_cover) || product.images?.[0];
              const imgUrl = cover ? cover.image_url : null;
              const tl = timeLeft(product.reserved_until);
              const seller = product.user;
              return (
                <div key={product.id} className="off-card">
                  {imgUrl
                    ? <img className="off-card-img" src={imgUrl} alt={product.name} onClick={() => navigate(`/products/${product.id}`)} />
                    : <div className="off-card-img-ph" onClick={() => navigate(`/products/${product.id}`)}><span /><span /><span /></div>
                  }
                  <div className="off-card-body">
                    <div className="off-card-top">
                      <div>
                        <div className="off-card-meta">
                          {product.code && <span className="off-card-code">{product.code}</span>}
                        </div>
                        <div className="off-card-name" onClick={() => navigate(`/products/${product.id}`)}>
                          {product.name}
                        </div>
                        {seller && <p className="off-card-person">Vendedor: <strong>{seller.name}</strong></p>}
                      </div>
                      <span className="off-badge off-badge--reservada">
                        <span className="off-badge-dot" />Reservado
                      </span>
                    </div>

                    <div className="off-prices">
                      <div className="off-price-item">
                        <span className="off-price-lbl">Valor</span>
                        <span className="off-price-new" style={{ color: '#3E5C43' }}>{fmtBRL(product.price)}</span>
                      </div>
                    </div>

                    <div className="off-card-foot">
                      {tl && (
                        <span className={`off-timer ${tl.soon ? 'off-timer--soon' : ''}`}>
                          <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {tl.text}
                        </span>
                      )}
                      <button className="off-btn off-btn--ghost" onClick={() => navigate(`/products/${product.id}`)}>
                        {seller?.pix_key ? 'Ver produto e pagar' : 'Ver produto'}
                      </button>
                    </div>

                    {seller?.pix_key && (
                      <p className="off-card-person" style={{ marginTop: '0.5rem' }}>
                        PIX ({PIX_KEY_TYPE_LABEL[seller.pix_key_type] || seller.pix_key_type}): <strong>{seller.pix_key}</strong>
                      </p>
                    )}
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
