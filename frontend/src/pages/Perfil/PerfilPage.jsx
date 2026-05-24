import { useEffect, useState } from 'react';
import { fetchMyProfile, updateMyProfile } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import './PerfilPage.css';

const PIX_LABELS = {
  telefone: 'Telefone',
  email: 'E-mail',
  cpf: 'CPF',
  aleatoria: 'Chave Aleatória',
};

const PIX_TYPES = ['telefone', 'email', 'cpf', 'aleatoria'];

export default function PerfilPage() {
  const [user, setUser]       = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk]   = useState(false);
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

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  function openEdit() {
    setForm({
      name:         user.name        || '',
      phone:        user.phone       || '',
      pix_key:      user.pix_key     || '',
      pix_key_type: user.pix_key_type || 'telefone',
    });
    setSaveError('');
    setSaveOk(false);
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
    setSaveOk(false);
    try {
      const updated = await updateMyProfile({
        name:         form.name.trim(),
        phone:        form.phone.trim(),
        pix_key:      form.pix_key.trim(),
        pix_key_type: form.pix_key_type,
      });
      setUser(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
      setSaveOk(true);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="perfil-page">

      <PageHero>
        <div className="page-hero-avatar"><span>{initials}</span></div>
        <div>
          <h1 className="page-hero-title">{user.name || '—'}</h1>
          <span className={`perfil-role-badge role-${user.role}`}>
            {user.role === 'admin' ? 'Administrador' : user.role === 'vendedor' ? 'Vendedor' : 'Usuário'}
          </span>
        </div>
      </PageHero>

      {/* Cards de dados */}
      <div className="perfil-content">
        {saveOk && (
          <div className="perfil-alert perfil-alert--ok">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6.5 10l2.5 2.5 4-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Perfil atualizado com sucesso!
          </div>
        )}

        {!editing ? (
          /* ── Modo visualização ── */
          <div className="perfil-grid">

            <section className="perfil-card">
              <div className="perfil-card-header">
                <svg viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h2>Dados pessoais</h2>
              </div>
              <div className="perfil-fields">
                <DataRow label="Nome completo" value={user.name} />
                <DataRow label="E-mail"        value={user.email} />
                <DataRow label="Telefone"      value={user.phone} />
              </div>
            </section>

            <section className="perfil-card">
              <div className="perfil-card-header">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L14 6H11V14H14L10 18L6 14H9V6H6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <h2>Dados PIX</h2>
              </div>
              <div className="perfil-fields">
                <DataRow label="Tipo de chave" value={PIX_LABELS[user.pix_key_type] || user.pix_key_type} />
                <DataRow label="Chave PIX"     value={user.pix_key} mono />
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
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
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
                </div>
              </section>

              <section className="perfil-card">
                <div className="perfil-card-header">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L14 6H11V14H14L10 18L6 14H9V6H6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <h2>Dados PIX</h2>
                </div>
                <div className="perfil-fields perfil-fields--edit">
                  <label className="perfil-field-edit">
                    <span>Tipo de chave</span>
                    <select
                      value={form.pix_key_type}
                      onChange={e => setForm(f => ({ ...f, pix_key_type: e.target.value }))}
                    >
                      {PIX_TYPES.map(t => (
                        <option key={t} value={t}>{PIX_LABELS[t]}</option>
                      ))}
                    </select>
                  </label>
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

function DataRow({ label, value, mono }) {
  return (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <span className={`data-value ${mono ? 'mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}
