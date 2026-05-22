import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyProducts } from '../../services/api';
import './MeusProdutosPage.css';

const STATUS_LABEL = { disponivel: 'Disponível', reservada: 'Reservado', vendida: 'Vendido' };
const STATUS_CLASS  = { disponivel: 'mp-status--green', reservada: 'mp-status--yellow', vendida: 'mp-status--gray' };

export default function MeusProdutosPage() {
  const navigate = useNavigate();
  const user     = JSON.parse(sessionStorage.getItem('user') || '{}');

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!user.id) return;
    fetchMyProducts(user.id)
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar seus produtos.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const total      = products.length;
  const disponiveis = products.filter(p => p.status === 'disponivel').length;
  const reservados  = products.filter(p => p.status === 'reservada').length;
  const vendidos    = products.filter(p => p.status === 'vendida').length;

  return (
    <div className="mp-page">

      {/* Hero */}
      <div className="mp-hero">
        <div className="mp-hero-diagonal" />
        <div className="mp-hero-inner">
          <div className="mp-hero-bars"><span/><span/><span/><span/></div>
          <div>
            <h1 className="mp-hero-title">Meus Produtos</h1>
            <p className="mp-hero-sub">Gerencie os produtos que você cadastrou</p>
          </div>
        </div>
      </div>

      <div className="mp-content">

        {/* Stats */}
        {!loading && !error && (
          <div className="mp-stats">
            <div className="mp-stat">
              <span className="mp-stat-val">{total}</span>
              <span className="mp-stat-lbl">Total</span>
            </div>
            <div className="mp-stat mp-stat--green">
              <span className="mp-stat-val">{disponiveis}</span>
              <span className="mp-stat-lbl">Disponíveis</span>
            </div>
            <div className="mp-stat mp-stat--yellow">
              <span className="mp-stat-val">{reservados}</span>
              <span className="mp-stat-lbl">Reservados</span>
            </div>
            <div className="mp-stat mp-stat--gray">
              <span className="mp-stat-val">{vendidos}</span>
              <span className="mp-stat-lbl">Vendidos</span>
            </div>
          </div>
        )}

        {/* Barra de ações */}
        <div className="mp-actions-bar">
          <h2 className="mp-section-title">Seus anúncios</h2>
          <button className="mp-btn-new" onClick={() => navigate('/novo-produto')}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd"/>
            </svg>
            Novo produto
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mp-list">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mp-skeleton" />
            ))}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mp-empty">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Vazio */}
        {!loading && !error && products.length === 0 && (
          <div className="mp-empty">
            <div className="mp-empty-bars"><span/><span/><span/></div>
            <p>Você ainda não cadastrou nenhum produto.</p>
            <button className="mp-btn-new" onClick={() => navigate('/novo-produto')}>
              Cadastrar primeiro produto
            </button>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && products.length > 0 && (
          <div className="mp-list">
            {products.map(product => (
              <ProductRow
                key={product.id}
                product={product}
                onView={() => navigate(`/products/${product.id}`)}
                onEdit={() => navigate(`/editar-produto/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product, onView, onEdit }) {
  const cover = product.images?.find(i => i.is_cover) || product.images?.[0];
  const imgUrl = cover ? cover.image_url : null;

  return (
    <div className="mp-row">
      {/* Imagem */}
      <div className="mp-row-img" onClick={onView}>
        {imgUrl
          ? <img src={imgUrl} alt={product.name} />
          : (
            <div className="mp-row-img-placeholder">
              <span/><span/><span/>
            </div>
          )
        }
      </div>

      {/* Info */}
      <div className="mp-row-info" onClick={onView}>
        <div className="mp-row-meta">
          <span className="mp-row-category">{product.category}</span>
          <span className="mp-row-code">{product.code}</span>
        </div>
        <h3 className="mp-row-name">{product.name}</h3>
        <p className="mp-row-brand">{product.brand} · Tam. {product.size}</p>
        <div className="mp-row-bottom">
          <span className="mp-row-price">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </span>
          <span className={`mp-row-status ${STATUS_CLASS[product.status]}`}>
            {STATUS_LABEL[product.status]}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="mp-row-actions">
        <button className="mp-btn-view" onClick={onView} title="Ver produto">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M2 10s2.5-5 8-5 8 5 8 5-2.5 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Ver</span>
        </button>
        <button className="mp-btn-edit" onClick={onEdit} title="Editar produto">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span>Editar</span>
        </button>
      </div>
    </div>
  );
}
