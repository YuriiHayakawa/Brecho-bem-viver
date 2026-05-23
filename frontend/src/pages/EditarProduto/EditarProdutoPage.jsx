import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, updateProduct, uploadProductImage } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import '../NovoProduto/NovoProdutoPage.css';
import './EditarProdutoPage.css';

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

export default function EditarProdutoPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages]   = useState([]); // { file, preview }
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [progress, setProgress]     = useState('');

  // ── Carrega produto ──────────────────────────
  useEffect(() => {
    fetchProduct(id)
      .then(p => {
        setForm({
          name:               p.name,
          description:        p.description || '',
          brand:              p.brand,
          category:           p.category,
          gender:             p.gender,
          size:               p.size,
          price:              String(p.price),
          has_defect:         p.has_defect,
          defect_description: p.defect_description || '',
        });
        setExistingImages(p.images || []);
      })
      .catch(() => setFetchError('Não foi possível carregar o produto.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Handlers ────────────────────────────────
  function set(field) {
    return e => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm(f => ({ ...f, [field]: value }));
    };
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    const imgs  = files
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages(prev => [...prev, ...imgs]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imgs  = files
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages(prev => [...prev, ...imgs]);
  }

  function removeNew(index) {
    setNewImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  // ── Submit ───────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim())        return setError('Informe o nome do produto.');
    if (!form.description.trim()) return setError('Informe a descrição.');
    if (!form.brand.trim())       return setError('Informe a marca.');
    if (!form.category)           return setError('Selecione uma categoria.');
    if (!form.price || Number(form.price) <= 0) return setError('Informe um preço válido.');

    setSaving(true);
    try {
      setProgress('Salvando alterações...');
      await updateProduct(id, {
        name:               form.name.trim(),
        description:        form.description.trim(),
        brand:              form.brand.trim(),
        category:           form.category,
        gender:             form.gender,
        size:               form.size,
        price:              parseFloat(form.price),
        has_defect:         form.has_defect,
        defect_description: form.has_defect ? form.defect_description.trim() : '',
      });

      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          setProgress(`Enviando foto ${i + 1} de ${newImages.length}...`);
          await uploadProductImage(id, newImages[i].file);
        }
      }

      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setProgress('');
    }
  }

  // ── Loading / error ──────────────────────────
  if (loading) {
    return (
      <div className="np-page">
        <PageHero title="Editar Produto" subtitle="Carregando..." />
        <div className="np-content">
          <div className="ep-skeleton-list">
            {[...Array(4)].map((_, i) => <div key={i} className="ep-skeleton" />)}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="np-page">
        <PageHero title="Editar Produto" />
        <div className="np-content">
          <div className="np-error">{fetchError}</div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────
  return (
    <div className="np-page">

      <PageHero title="Editar Produto" subtitle="Atualize as informações do item" />

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
                  <div
                    className={`np-toggle ${form.has_defect ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, has_defect: !f.has_defect }))}
                  >
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
                <p className="np-section-desc">Fotos atuais do produto. Adicione novas se desejar.</p>
              </div>
            </div>

            {/* Fotos existentes */}
            {existingImages.length > 0 && (
              <div className="ep-existing-images">
                <p className="ep-existing-label">Fotos cadastradas</p>
                <div className="np-images-preview">
                  {existingImages
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((img, index) => (
                      <div key={img.id} className={`np-image-item ${img.is_cover ? 'is-cover' : ''}`}>
                        <img
                          src={img.image_url}
                          alt={`foto ${index + 1}`}
                        />
                        {img.is_cover && <span className="np-cover-badge">Capa</span>}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Drop zone para novas fotos */}
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
              <p className="np-dropzone-text">Adicionar novas fotos</p>
              <p className="np-dropzone-hint">PNG, JPG, WEBP — múltiplas fotos permitidas</p>
            </div>

            {/* Preview das novas fotos */}
            {newImages.length > 0 && (
              <div className="np-images-preview">
                {newImages.map((img, index) => (
                  <div key={index} className="np-image-item ep-new-badge-wrap">
                    <img src={img.preview} alt={`nova foto ${index + 1}`} />
                    <span className="ep-new-badge">Nova</span>
                    <div className="np-image-actions">
                      <button
                        type="button"
                        className="np-img-btn np-img-btn--remove"
                        title="Remover foto"
                        onClick={() => removeNew(index)}
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
              onClick={() => navigate('/meus-produtos')}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="np-btn-submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="np-spinner" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15"/>
                  </svg>
                  {progress || 'Salvando...'}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
                  </svg>
                  Salvar alterações
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
