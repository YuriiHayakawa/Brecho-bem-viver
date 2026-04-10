import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { fetchProducts } from '../../services/api';
import './DashboardPage.css';

const STATUS_LABEL = {
  disponivel: 'Disponível',
  reservada: 'Reservado',
  vendida: 'Vendido',
};

const GENDERS = ['Todos', 'masculino', 'feminino', 'unissex', 'infantil'];
const STATUSES = ['Todos', 'disponivel', 'reservada', 'vendida'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterGender, setFilterGender] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('disponivel');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar os produtos.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todas', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'Todas' || p.category === filterCategory;
    const matchGender = filterGender === 'Todos' || p.gender === filterGender;
    const matchStatus = filterStatus === 'Todos' || p.status === filterStatus;
    return matchSearch && matchCat && matchGender && matchStatus;
  });

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <div className="dashboard-hero">
        <div className="hero-bars">
          <span className="hb b1" /><span className="hb b2" />
          <span className="hb b3" /><span className="hb b4" />
        </div>
        <div className="hero-text">
          <h1>Catálogo do Bazar</h1>
          <p>Encontre peças únicas e ajude quem mais precisa</p>
        </div>
      </div>

      <main className="dashboard-main">
        {/* Filtros */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome ou marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              {GENDERS.map(g => <option key={g}>{g}</option>)}
            </select>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <span className="results-count">{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Grid */}
        {loading && (
          <div className="state-container">
            <div className="loading-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          </div>
        )}

        {error && (
          <div className="state-container">
            <div className="error-state">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="state-container">
            <div className="empty-state">
              <div className="empty-bars">
                <span /><span /><span />
              </div>
              <p>Nenhum produto encontrado</p>
              <button onClick={() => { setSearch(''); setFilterCategory('Todas'); setFilterGender('Todos'); setFilterStatus('Todos'); }}>
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="products-grid">
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
  const imageUrl = coverImage ? `http://localhost:8000${coverImage.image_url}` : null;

  return (
    <article className="product-card" onClick={onClick}>
      <div className="card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
        ) : (
          <div className="card-image-placeholder">
            <div className="placeholder-bars">
              <span /><span /><span /><span />
            </div>
          </div>
        )}
        <span className={`card-status status-${product.status}`}>
          {STATUS_LABEL[product.status]}
        </span>
        {product.has_defect && (
          <span className="card-defect-badge">Com defeito</span>
        )}
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-category">{product.category}</span>
          <span className="card-size">{product.size}</span>
        </div>
        <h3 className="card-name">{product.name}</h3>
        <p className="card-brand">{product.brand}</p>
        <div className="card-footer">
          <span className="card-price">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </span>
          <span className="card-code">{product.code}</span>
        </div>
      </div>
    </article>
  );
}
