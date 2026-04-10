import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { fetchProduct, reserveProduct } from '../../services/api';
import './ProductDetailPage.css';

const STATUS_LABEL = {
  disponivel: 'Disponível',
  reservada: 'Reservado',
  vendida: 'Vendido',
};

const GENDER_LABEL = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  unissex: 'Unissex',
  infantil: 'Infantil',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState('');

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProduct(id)
      .then(data => { setProduct(data); })
      .catch(() => setError('Produto não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReserve() {
    setReserving(true);
    setReserveError('');
    try {
      const updated = await reserveProduct(id, user.id);
      setProduct(updated);
      setReserveSuccess(true);
    } catch (err) {
      setReserveError(err.message);
    } finally {
      setReserving(false);
    }
  }

  if (loading) return (
    <div className="detail-wrapper">
      <Navbar />
      <div className="detail-loading">
        <div className="detail-skeleton" />
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="detail-wrapper">
      <Navbar />
      <div className="detail-error">
        <p>{error || 'Produto não encontrado.'}</p>
        <button onClick={() => navigate('/dashboard')}>← Voltar ao catálogo</button>
      </div>
    </div>
  );

  const images = product.images || [];
  const activeImageUrl = images[activeImage]
    ? `http://localhost:8000${images[activeImage].image_url}`
    : null;

  const isReservedByMe = product.reserved_by_user_id === user.id;

  return (
    <div className="detail-wrapper">
      <Navbar />

      <main className="detail-main">
        {/* Breadcrumb */}
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar ao catálogo
        </button>

        <div className="detail-content">
          {/* Galeria */}
          <div className="detail-gallery">
            <div className="gallery-main">
              {activeImageUrl ? (
                <img src={activeImageUrl} alt={product.name} />
              ) : (
                <div className="gallery-placeholder">
                  <div className="gallery-bars">
                    <span /><span /><span /><span />
                  </div>
                  <p>Sem imagem</p>
                </div>
              )}
              <span className={`detail-status-badge status-${product.status}`}>
                {STATUS_LABEL[product.status]}
              </span>
            </div>

            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    className={`thumb ${i === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={`http://localhost:8000${img.image_url}`} alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="detail-info">
            <div className="detail-header">
              {product.code && <span className="detail-code">{product.code}</span>}
              <h1 className="detail-name">{product.name}</h1>
              <p className="detail-price">
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="detail-divider" />

            <div className="detail-attrs">
              <div className="attr-row">
                <span className="attr-label">Categoria</span>
                <span className="attr-value">{product.category}</span>
              </div>
              <div className="attr-row">
                <span className="attr-label">Tamanho</span>
                <span className="attr-value">{product.size}</span>
              </div>
              <div className="attr-row">
                <span className="attr-label">Marca</span>
                <span className="attr-value">{product.brand}</span>
              </div>
              <div className="attr-row">
                <span className="attr-label">Gênero</span>
                <span className="attr-value">{GENDER_LABEL[product.gender] || product.gender}</span>
              </div>
            </div>

            <div className="detail-divider" />

            <div className="detail-description">
              <h3>Descrição</h3>
              <p>{product.description}</p>
            </div>

            {product.has_defect && (
              <div className="defect-warning">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                </svg>
                <div>
                  <strong>Produto com defeito</strong>
                  {product.defect_description && <p>{product.defect_description}</p>}
                </div>
              </div>
            )}

            {/* Ação de reserva */}
            <div className="detail-action">
              {reserveSuccess || (product.status === 'reservada' && isReservedByMe) ? (
                <div className="reserve-success">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <strong>Produto reservado para você!</strong>
                    <p>A reserva é válida por 48 horas.</p>
                  </div>
                </div>
              ) : product.status === 'disponivel' ? (
                <>
                  {reserveError && (
                    <p className="reserve-error">{reserveError}</p>
                  )}
                  <button
                    className="btn-reserve"
                    onClick={handleReserve}
                    disabled={reserving}
                  >
                    {reserving ? (
                      <span className="btn-loading">
                        <svg className="spinner" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15"/>
                        </svg>
                        Reservando...
                      </span>
                    ) : (
                      'Reservar produto'
                    )}
                  </button>
                  <p className="reserve-notice">A reserva é válida por 48 horas</p>
                </>
              ) : product.status === 'reservada' ? (
                <div className="unavailable-badge">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                  </svg>
                  Este produto já está reservado
                </div>
              ) : (
                <div className="unavailable-badge sold">
                  Este produto já foi vendido
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
