import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import './CatalogoPage.css';


const STATUS_LABEL = {
  disponivel: 'Disponível',
  reservada: 'Reservado',
  vendida: 'Vendido',
};

const GENDERS  = ['Todos', 'masculino', 'feminino', 'unissex', 'infantil'];
const STATUSES = ['Todos', 'disponivel', 'reservada', 'vendida'];

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterGender, setFilterGender]   = useState('Todos');
  const [filterStatus, setFilterStatus]   = useState('disponivel');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar os produtos.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todas', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch  = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat     = filterCategory === 'Todas'    || p.category === filterCategory;
    const matchGender  = filterGender  === 'Todos'    || p.gender   === filterGender;
    const matchStatus  = filterStatus  === 'Todos'    || p.status   === filterStatus;
    return matchSearch && matchCat && matchGender && matchStatus;
  });

  return (
    <div className="catalogo-wrapper">
      <PageHero title="Catálogo do Bazar" subtitle="Encontre peças únicas e ajude quem mais precisa" />

      <main className="catalogo-main">
        {/* Barra de ações */}
        <div className="catalogo-actions-bar">
          <button
            className="catalogo-btn-novo"
            onClick={() => navigate('/novo-produto')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd"/>
            </svg>
            Novo produto
          </button>
        </div>

        {/* Filtros */}
        <div className="catalogo-filters-bar">
          <div className="catalogo-search-wrapper">
            <svg className="catalogo-search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="catalogo-search-input"
              placeholder="Buscar por nome ou marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="catalogo-filter-selects">
            <select className="catalogo-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="catalogo-filter-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
            <select className="catalogo-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <span className="catalogo-results-count">
            {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Estados */}
        {loading && (
          <div className="catalogo-state-container">
            <div className="catalogo-loading-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="catalogo-skeleton-card" />)}
            </div>
          </div>
        )}

        {error && (
          <div className="catalogo-state-container">
            <div className="catalogo-error-state">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="catalogo-state-container">
            <div className="catalogo-empty-state">
              <div className="catalogo-empty-bars">
                <span /><span /><span />
              </div>
              <p>Nenhum produto encontrado</p>
              <button onClick={() => {
                setSearch('');
                setFilterCategory('Todas');
                setFilterGender('Todos');
                setFilterStatus('Todos');
              }}>
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="catalogo-products-grid">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const coverImage = product.images?.find(img => img.is_cover) || product.images?.[0];
  const imageUrl   = coverImage ? coverImage.image_url : null;

  return (
    <article className="catalogo-product-card" onClick={onClick}>
      <div className="catalogo-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
        ) : (
          <div className="catalogo-card-placeholder">
            <div className="catalogo-placeholder-bars">
              <span /><span /><span /><span />
            </div>
          </div>
        )}
        <span className={`catalogo-card-status status-${product.status}`}>
          {STATUS_LABEL[product.status]}
        </span>
        {product.has_defect && (
          <span className="catalogo-card-defect">Com defeito</span>
        )}
      </div>

      <div className="catalogo-card-body">
        <div className="catalogo-card-meta">
          <span className="catalogo-card-category">{product.category}</span>
          <span className="catalogo-card-size">{product.size}</span>
        </div>
        <h3 className="catalogo-card-name">{product.name}</h3>
        <p className="catalogo-card-brand">{product.brand}</p>
        <div className="catalogo-card-footer">
          <span className="catalogo-card-price">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </span>
          <span className="catalogo-card-code">{product.code}</span>
        </div>
      </div>
    </article>
  );
}
