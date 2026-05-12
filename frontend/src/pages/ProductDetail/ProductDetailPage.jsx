import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, reserveProduct, fetchProductLabelData } from '../../services/api';
import './ProductDetailPage.css';

const BASE_URL = 'http://localhost:8000';

const STATUS_LABEL = {
  disponivel: 'Disponível',
  reservada:  'Reservado',
  vendida:    'Vendido',
};

const PIX_KEY_TYPE_LABEL = {
  cpf:       'CPF',
  telefone:  'Telefone',
  email:     'E-mail',
  aleatoria: 'Chave Aleatória',
};

const GENDER_LABEL = {
  masculino: 'Masculino',
  feminino:  'Feminino',
  unissex:   'Unissex',
  infantil:  'Infantil',
};

const PIX_KEY_LABEL = {
  cpf:       'CPF',
  telefone:  'Telefone',
  email:     'E-mail',
  aleatoria: 'Chave Aleatória',
};

// ─────────────────────────────────────────────
// Modal de Etiqueta
// ─────────────────────────────────────────────
function LabelModal({ productId, productName, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchProductLabelData(productId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [productId]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="label-overlay" onClick={onClose}>
      <div className="label-modal" onClick={e => e.stopPropagation()}>

        {/* Cabeçalho do modal */}
        <div className="label-modal-header">
          <span className="label-modal-title">Etiqueta do produto</span>
          <button className="label-modal-close" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        {loading && (
          <div className="label-loading">
            <div className="label-sk" /><div className="label-sk" /><div className="label-sk label-sk--sm" />
          </div>
        )}

        {error && (
          <div className="label-error">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#DC2626" strokeWidth="1.5"/>
              <path d="M10 6v4M10 13h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* ── A etiqueta em si (área imprimível) ── */}
            <div className="label-card" id="label-print-area">

              {/* Topo azul Sebrae */}
              <div className="label-top">
                <div className="label-brand-bars">
                  <span /><span /><span /><span />
                </div>
                <div className="label-brand-text">
                  <span className="label-brand-name">SEBRAE</span>
                  <span className="label-brand-sub">Bazar</span>
                </div>
                {data.product_code && (
                  <span className="label-code">#{data.product_code}</span>
                )}
              </div>

              {/* Corpo */}
              <div className="label-body">
                <h2 className="label-product-name">{data.product_name}</h2>

                <div className="label-price-block">
                  <span className="label-price-label">Preço</span>
                  <span className="label-price">
                    {Number(data.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="label-divider" />

                <div className="label-pix-section">
                  <div className="label-pix-left">
                    <p className="label-seller-name">{data.seller_name}</p>
                    <div className="label-pix-row">
                      <span className="label-pix-type">{PIX_KEY_LABEL[data.pix_key_type] || data.pix_key_type}</span>
                      <span className="label-pix-key">{data.pix_key}</span>
                    </div>
                    <p className="label-pix-hint">Escaneie o QR Code para pagar via PIX</p>
                  </div>
                  <div className="label-qr">
                    <img
                      src={`${BASE_URL}${data.qr_code_url}`}
                      alt="QR Code PIX"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Ação */}
            <div className="label-actions">
              <button className="label-btn-print" onClick={handlePrint}>
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M5 7V3h10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="7" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 15v2h6v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="15" cy="11" r="1" fill="currentColor"/>
                </svg>
                Imprimir etiqueta
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────
function Lightbox({ images, startIndex, productName, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const url = `${BASE_URL}${images[index].image_url}`;

  return (
    <div className="lb-overlay" onClick={onClose}>

      {/* Barra superior */}
      <div className="lb-topbar" onClick={e => e.stopPropagation()}>
        <span className="lb-title">{productName}</span>
        <div className="lb-topbar-right">
          <span className="lb-counter">{index + 1} / {images.length}</span>
          <button className="lb-close" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Imagem central */}
      <div className="lb-stage" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button className="lb-arrow lb-arrow--left" onClick={prev} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="lb-img-wrapper">
          <img
            key={url}
            src={url}
            alt={`${productName} — foto ${index + 1}`}
            className="lb-img"
          />
        </div>

        {images.length > 1 && (
          <button className="lb-arrow lb-arrow--right" onClick={next} aria-label="Próxima">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={img.id}
              className={`lb-thumb ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <img src={`${BASE_URL}${img.image_url}`} alt={`miniatura ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeImage, setActiveImage]   = useState(0);
  const [lightbox, setLightbox]         = useState(null); // null | index
  const [reserving, setReserving]       = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [pixCopied, setPixCopied]       = useState(false);
  const [labelOpen, setLabelOpen]       = useState(false);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProduct(id)
      .then(data => setProduct(data))
      .catch(() => setError('Produto não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReserve() {
    setReserving(true);
    setReserveError('');
    try {
      const updated = await reserveProduct(id);
      setProduct(updated);
      setReserveSuccess(true);
    } catch (err) {
      setReserveError(err.message);
    } finally {
      setReserving(false);
    }
  }

  function handleCopyPix() {
    if (!seller?.pix_key) return;
    navigator.clipboard.writeText(seller.pix_key);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  }

  if (loading) return (
    <div className="detail-wrapper">
      <div className="detail-loading"><div className="detail-skeleton" /></div>
    </div>
  );

  if (error || !product) return (
    <div className="detail-wrapper">
      <div className="detail-error">
        <p>{error || 'Produto não encontrado.'}</p>
        <button onClick={() => navigate('/catalogo')}>← Voltar ao catálogo</button>
      </div>
    </div>
  );

  const images          = product.images || [];
  const activeImageUrl  = images[activeImage] ? `${BASE_URL}${images[activeImage].image_url}` : null;
  const isReservedByMe  = product.reserved_by_user_id === user.id;
  const seller          = product.user;

  return (
    <div className="detail-wrapper">
      {/* Lightbox */}
      {lightbox !== null && images.length > 0 && (
        <Lightbox
          images={images}
          startIndex={lightbox}
          productName={product.name}
          onClose={() => setLightbox(null)}
        />
      )}

      {labelOpen && (
        <LabelModal
          productId={id}
          productName={product.name}
          onClose={() => setLabelOpen(false)}
        />
      )}

      <main className="detail-main">
        <div className="detail-topbar">
          <button className="back-btn" onClick={() => navigate('/catalogo')}>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar ao catálogo
          </button>
          <button className="label-trigger-btn" onClick={() => setLabelOpen(true)}>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 4h5.172a2 2 0 011.414.586l5.828 5.828a2 2 0 010 2.828l-3.172 3.172a2 2 0 01-2.828 0L4.586 10.586A2 2 0 014 9.172V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>
            </svg>
            Gerar etiqueta
          </button>
        </div>

        <div className="detail-content">
          {/* ── Galeria ── */}
          <div className="detail-gallery">
            <div
              className="gallery-main"
              onClick={() => images.length > 0 && setLightbox(activeImage)}
              style={{ cursor: images.length > 0 ? 'zoom-in' : 'default' }}
            >
              {activeImageUrl ? (
                <>
                  <img src={activeImageUrl} alt={product.name} />
                  <div className="gallery-zoom-hint">
                    <svg viewBox="0 0 20 20" fill="none">
                      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8.5 6.5v4M6.5 8.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Ampliar
                  </div>
                </>
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
                    <img src={`${BASE_URL}${img.image_url}`} alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Informações ── */}
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
                  {reserveError && <p className="reserve-error">{reserveError}</p>}
                  <button className="btn-reserve" onClick={handleReserve} disabled={reserving}>
                    {reserving ? (
                      <span className="btn-loading">
                        <svg className="spinner" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15"/>
                        </svg>
                        Reservando...
                      </span>
                    ) : 'Reservar produto'}
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
                <div className="unavailable-badge sold">Este produto já foi vendido</div>
              )}
            </div>

            {seller && (
              <div className="pix-section">
                <div className="pix-header">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6.5 6.5h.01M17.5 6.5h.01M6.5 17.5h.01M12 12h.01M17.5 17.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <h3>Pagamento via PIX</h3>
                </div>
                <div className="pix-body">
                  <div className="pix-qrcode-wrapper">
                    <img src={`${BASE_URL}/products/${product.id}/pix-qrcode`} alt="QR Code PIX" className="pix-qrcode-img"/>
                  </div>
                  <div className="pix-info">
                    <div className="pix-seller-name">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      <span>{seller.name}</span>
                    </div>
                    <div className="pix-key-row">
                      <span className="pix-key-type-badge">{PIX_KEY_TYPE_LABEL[seller.pix_key_type] || seller.pix_key_type}</span>
                      <span className="pix-key-value">{seller.pix_key}</span>
                    </div>
                    <button className="btn-copy-pix" onClick={handleCopyPix}>
                      {pixCopied ? (
                        <>
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                          </svg>
                          Chave copiada!
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 20 20" fill="none">
                            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Copiar chave PIX
                        </>
                      )}
                    </button>
                    <p className="pix-notice">Escaneie o QR Code ou copie a chave para pagar</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
