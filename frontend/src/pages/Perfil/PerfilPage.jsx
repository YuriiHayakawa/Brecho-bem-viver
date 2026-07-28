import { useEffect, useRef, useState } from 'react';
import { fetchMyProfile, updateMyProfile } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import { useToast } from '../../contexts/ToastContext';
import { UNITS } from '../../constants/units';
import './PerfilPage.css';

const PIX_LABELS = {
  telefone: 'Telefone',
  email: 'E-mail',
  cpf: 'CPF',
  aleatoria: 'Chave Aleatória',
};

const PIX_TYPES = ['telefone', 'email', 'cpf', 'aleatoria'];

export default function PerfilPage() {
  const showToast = useToast();
  const [user, setUser]       = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm]       = useState({});

  // Busca dados frescos da API
  useEffect(() => {
    fetchMyProfile()
      .then(data => {
        setUser(data);
        sessionStorage.setItem('user', JSON.stringify(data));
      })
      .catch(() => {}); // silencia: usa o sessionStorage como fallback
  }, []);

  function openEdit() {
    setForm({
      name:         user.name        || '',
      phone:        user.phone       || '',
      unit:         user.unit        || '',
      pix_key:      user.pix_key     || '',
      pix_key_type: user.pix_key_type || 'telefone',
    });
    setSaveError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateMyProfile({
        name:         form.name.trim(),
        phone:        form.phone.trim(),
        unit:         form.unit,
        pix_key:      form.pix_key.trim(),
        pix_key_type: form.pix_key_type,
      });
      setUser(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
      showToast('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="perfil-page">

      <PageHero title="Meu Perfil" subtitle="Visualize e edite suas informações pessoais" />

      {/* Cards de dados */}
      <div className="perfil-content">

        {!editing ? (
          /* ── Modo visualização ── */
          <div className="perfil-grid">

            <section className="perfil-card">
              <div className="perfil-card-header">
                <span className="perfil-card-icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <h2>Dados pessoais</h2>
              </div>
              <div className="perfil-fields">
                <DataRow label="Nome completo" value={user.name} />
                <DataRow label="E-mail"        value={user.email} />
                <DataRow label="Telefone"      value={user.phone} />
                <DataRow label="Unidade"       value={user.unit} />
              </div>
            </section>

            <section className="perfil-card perfil-card--pix">
              <div className="perfil-card-header">
                <span className="perfil-card-icon">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L14 6H11V14H14L10 18L6 14H9V6H6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2>Dados PIX</h2>
              </div>
              <div className="perfil-fields">
                <DataRow label="Tipo de chave" value={PIX_LABELS[user.pix_key_type] || user.pix_key_type} />
                <DataRow label="Chave PIX"     value={user.pix_key} />
              </div>
            </section>

            <div className="perfil-edit-row">
              <button className="perfil-btn-edit" onClick={openEdit}>
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.793 8.793-3.621.793.793-3.621 8.793-8.793z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Editar perfil
              </button>
            </div>

          </div>
        ) : (
          /* ── Modo edição ── */
          <form className="perfil-form" onSubmit={handleSave}>
            <div className="perfil-grid">

              <section className="perfil-card">
                <div className="perfil-card-header">
                  <span className="perfil-card-icon">
                    <svg viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <h2>Dados pessoais</h2>
                </div>
                <div className="perfil-fields perfil-fields--edit">
                  <label className="perfil-field-edit">
                    <span>Nome completo</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </label>
                  <DataRow label="E-mail" value={user.email} />
                  <label className="perfil-field-edit">
                    <span>Telefone</span>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </label>
                  <div className="perfil-field-edit">
                    <span id="unit-field-label">Unidade</span>
                    <Dropdown
                      labelId="unit-field-label"
                      value={form.unit}
                      onChange={u => setForm(f => ({ ...f, unit: u }))}
                      options={UNITS.map(u => ({ value: u, label: u }))}
                      placeholder="Selecione sua unidade"
                    />
                  </div>
                </div>
              </section>

              <section className="perfil-card perfil-card--pix">
                <div className="perfil-card-header">
                  <span className="perfil-card-icon">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M10 2L14 6H11V14H14L10 18L6 14H9V6H6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h2>Dados PIX</h2>
                </div>
                <div className="perfil-fields perfil-fields--edit">
                  <div className="perfil-field-edit">
                    <span id="pix-type-field-label">Tipo de chave</span>
                    <Dropdown
                      labelId="pix-type-field-label"
                      value={form.pix_key_type}
                      onChange={t => setForm(f => ({ ...f, pix_key_type: t }))}
                      options={PIX_TYPES.map(t => ({ value: t, label: PIX_LABELS[t] }))}
                    />
                  </div>
                  <label className="perfil-field-edit">
                    <span>Chave PIX</span>
                    <input
                      type="text"
                      value={form.pix_key}
                      onChange={e => setForm(f => ({ ...f, pix_key: e.target.value }))}
                    />
                  </label>
                </div>
              </section>

            </div>

            {saveError && <p className="perfil-save-error">{saveError}</p>}

            <div className="perfil-form-actions">
              <button type="button" className="perfil-btn-cancel" onClick={cancelEdit} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="perfil-btn-save" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <span className="data-value">{value || '—'}</span>
    </div>
  );
}

// Dropdown próprio (não usa <select> nativo) para garantir que a lista
// sempre abra para baixo, independente do espaço disponível na tela.
// options: [{ value, label }]
function Dropdown({ value, onChange, options, placeholder, labelId }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className="app-dropdown" ref={wrapperRef}>
      <button
        type="button"
        className={`app-dropdown-trigger ${open ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected ? '' : 'app-dropdown-placeholder'}>
          {selected ? selected.label : (placeholder || '')}
        </span>
        <svg className="app-dropdown-chevron" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="app-dropdown-list" role="listbox" aria-labelledby={labelId}>
          {options.map(o => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`app-dropdown-option ${o.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
