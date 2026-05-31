import { useState, useRef } from 'react';
import PageHero from '../../components/PageHero/PageHero';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadProductImage } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import './NovoProdutoPage.css';

const CATEGORIES = [
  'Camisetas', 'Calças', 'Vestidos', 'Saias', 'Shorts',
  'Jaquetas', 'Casacos', 'Blazers', 'Acessórios',
  'Calçados', 'Bolsas', 'Roupas infantis', 'Outros',
];

const GENDERS = [
  { value: 'feminino',  label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'unissex',   label: 'Unissex' },
  { value: 'infantil',  label: 'Infantil' },
];

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', 'Único',
               '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

export default function NovoProdutoPage() {
  const navigate   = useNavigate();
  const showToast  = useToast();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    gender: 'feminino',
    size: 'M',
    price: '',
    has_defect: false,
    defect_description: '',
  });

  const [images, setImages]     = useState([]); // { file, preview }
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [progress, setProgress] = useState(''); // mensagem de progresso

  // ── handlers ──────────────────────────────────
  function set(field) {
    return e => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm(f => ({ ...f, [field]: value }));
    };
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    const newImages = files
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newImages = files
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages]);
  }

  function removeImage(index) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveImage(from, to) {
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }

  // ── submit ────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim())        return setError('Informe o nome do produto.');
    if (!form.description.trim()) return setError('Informe a descrição.');
    if (!form.brand.trim())       return setError('Informe a marca.');
    if (!form.category)           return setError('Selecione uma categoria.');
    if (!form.price || Number(form.price) <= 0) return setError('Informe um preço válido.');
    if (!user.id)                 return setError('Usuário não autenticado.');

    setLoading(true);
    try {
      // 1. Cria o produto
      setProgress('Criando produto...');
      const product = await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        category: form.category,
        gender: form.gender,
        size: form.size,
        price: parseFloat(form.price),
        has_defect: form.has_defect,
        defect_description: form.has_defect ? form.defect_description.trim() : '',
      });

      // 2. Faz upload das imagens em sequência
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setProgress(`Enviando foto ${i + 1} de ${images.length}...`);
          await uploadProductImage(product.id, images[i].file);
        }
      }

      showToast('Produto criado com sucesso!');
      navigate(`/products/${product.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  }

  // ── render ────────────────────────────────────
  return (
    <main className="np-page">

        <PageHero title="Novo Produto" subtitle="Cadastre um item para vender no bazar" />

        {/* Formulário */}
        <div className="np-content">
          <form className="np-form" onSubmit={handleSubmit} noValidate>

            {/* ── Seção 1: Informações básicas ── */}
            <section className="np-section">
              <div className="np-section-header">
                <div className="np-section-icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="np-section-title">Informações básicas</h2>
                  <p className="np-section-desc">Dados principais do produto</p>
                </div>
              </div>

              <div className="np-fields">
                <div className="np-field np-field-full">
                  <label className="np-label">Nome do produto <span className="np-required">*</span></label>
                  <input
                    type="text"
                    className="np-input"
                    placeholder="Ex: Jaqueta jeans azul escuro"
                    value={form.name}
                    onChange={set('name')}
                    maxLength={200}
                  />
                </div>

                <div className="np-field">
                  <label className="np-label">Marca <span className="np-required">*</span></label>
                  <input
                    type="text"
                    className="np-input"
                    placeholder="Ex: Levi's, Zara, sem marca..."
                    value={form.brand}
                    onChange={set('brand')}
                    maxLength={100}
                  />
                </div>

                <div className="np-field">
                  <label className="np-label">Categoria <span className="np-required">*</span></label>
                  <select className="np-select" value={form.category} onChange={set('category')}>
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="np-field">
                  <label className="np-label">Gênero</label>
                  <select className="np-select" value={form.gender} onChange={set('gender')}>
                    {GENDERS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div className="np-field">
                  <label className="np-label">Tamanho</label>
                  <select className="np-select" value={form.size} onChange={set('size')}>
                    {SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="np-field">
                  <label className="np-label">Preço sugerido (R$) <span className="np-required">*</span></label>
                  <div className="np-price-wrapper">
                    <span className="np-price-prefix">R$</span>
                    <input
                      type="number"
                      className="np-input np-input-price"
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={set('price')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Seção 2: Descrição ── */}
            <section className="np-section">
              <div className="np-section-header">
                <div className="np-section-icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M4 6h12M4 10h12M4 14h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="np-section-title">Descrição</h2>
                  <p className="np-section-desc">Descreva o produto com detalhes</p>
                </div>
              </div>

              <div className="np-fields">
                <div className="np-field np-field-full">
                  <label className="np-label">Descrição do produto <span className="np-required">*</span></label>
                  <textarea
                    className="np-textarea"
                    placeholder="Descreva o estado, tecido, cor, detalhes importantes..."
                    rows={4}
                    value={form.description}
                    onChange={set('description')}
                  />
                </div>
              </div>
            </section>

            {/* ── Seção 3: Defeito ── */}
            <section className="np-section">
              <div className="np-section-header">
                <div className="np-section-icon np-section-icon--warn">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 7v4M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="np-section-title">Defeitos</h2>
                  <p className="np-section-desc">Seja transparente sobre o estado do item</p>
                </div>
              </div>

              <div className="np-fields">
                <div className="np-field np-field-full">
                  <label className="np-toggle-label">
                    <div className={`np-toggle ${form.has_defect ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, has_defect: !f.has_defect }))}>
                      <span className="np-toggle-thumb" />
                    </div>
                    <span>O produto possui defeito</span>
                  </label>
                </div>

                {form.has_defect && (
                  <div className="np-field np-field-full">
                    <label className="np-label">Descreva o defeito</label>
                    <textarea
                      className="np-textarea np-textarea--warn"
                      placeholder="Ex: Pequeno rasgo na bainha, botão faltando..."
                      rows={3}
                      value={form.defect_description}
                      onChange={set('defect_description')}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── Seção 4: Fotos ── */}
            <section className="np-section">
              <div className="np-section-header">
                <div className="np-section-icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="10" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 4l1-2h4l1 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="np-section-title">Fotos</h2>
                  <p className="np-section-desc">A primeira foto será a capa. Arraste para reordenar.</p>
                </div>
              </div>

              {/* Drop zone */}
              <div
                className="np-dropzone"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <div className="np-dropzone-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="np-dropzone-text">
                  Clique ou arraste fotos aqui
                </p>
                <p className="np-dropzone-hint">PNG, JPG, WEBP — múltiplas fotos permitidas</p>
              </div>

              {/* Preview das imagens */}
              {images.length > 0 && (
                <div className="np-images-preview">
                  {images.map((img, index) => (
                    <div key={index} className={`np-image-item ${index === 0 ? 'is-cover' : ''}`}>
                      <img src={img.preview} alt={`foto ${index + 1}`} />
                      {index === 0 && <span className="np-cover-badge">Capa</span>}
                      <div className="np-image-actions">
                        {index > 0 && (
                          <button
                            type="button"
                            className="np-img-btn"
                            title="Mover para esquerda"
                            onClick={() => moveImage(index, index - 1)}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11 8H5M5 8l3-3M5 8l3 3"/>
                            </svg>
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            className="np-img-btn"
                            title="Mover para direita"
                            onClick={() => moveImage(index, index + 1)}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5 8h6M11 8l-3-3M11 8l-3 3"/>
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          className="np-img-btn np-img-btn--remove"
                          title="Remover foto"
                          onClick={() => removeImage(index)}
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 4l8 8M12 4l-8 8"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Erro e ações ── */}
            {error && (
              <div className="np-error">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <div className="np-actions">
              <button
                type="button"
                className="np-btn-cancel"
                onClick={() => navigate('/catalogo')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="np-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="np-spinner" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15"/>
                    </svg>
                    {progress || 'Salvando...'}
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd"/>
                    </svg>
                    Publicar produto
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
  );
}
