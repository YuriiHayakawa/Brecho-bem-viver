import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, updateUserRole, updateUserByAdmin } from '../../services/api';
import PageHero from '../../components/PageHero/PageHero';
import { useToast } from '../../contexts/ToastContext';
import './GestaoUsuariosPage.css';

const ROLE_LABEL = { admin: 'Admin', vendedor: 'Vendedor', user: 'Usuário' };
const ROLE_CLASS  = { admin: 'gu-role--admin', vendedor: 'gu-role--vendedor', user: 'gu-role--user' };
const ROLES       = ['user', 'admin'];
const PIX_TYPES   = ['telefone', 'email', 'cpf', 'aleatoria'];

export default function GestaoUsuariosPage() {
  const navigate    = useNavigate();
  const showToast   = useToast();
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('Todos');

  // role inline
  const [updatingRole, setUpdatingRole] = useState(null);
  const [roleFeedback, setRoleFeedback] = useState(null); // { id, ok }

  // modal edição
  const [editUser, setEditUser]   = useState(null); // usuário sendo editado
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (currentUser.role !== 'admin') { navigate('/dashboard'); return; }
    fetchAllUsers()
      .then(setUsers)
      .catch(() => setError('Não foi possível carregar os usuários.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Role inline ──────────────────────────────────────
  async function handleRoleChange(userId, newRole) {
    setUpdatingRole(userId);
    setRoleFeedback(null);
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      setRoleFeedback({ id: userId, ok: true });
      showToast('Permissão atualizada com sucesso!');
    } catch {
      setRoleFeedback({ id: userId, ok: false });
      showToast('Erro ao atualizar permissão.', 'error');
    } finally {
      setUpdatingRole(null);
      setTimeout(() => setRoleFeedback(null), 2500);
    }
  }

  // ── Modal edição ─────────────────────────────────────
  function openEdit(user) {
    setEditUser(user);
    setEditForm({
      name:         user.name,
      email:        user.email,
      phone:        user.phone,
      pix_key:      user.pix_key,
      pix_key_type: user.pix_key_type,
    });
    setEditError('');
  }

  function closeEdit() {
    setEditUser(null);
    setEditError('');
  }

  function setField(field) {
    return e => setEditForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editForm.name?.trim())  return setEditError('Nome é obrigatório.');
    if (!editForm.email?.trim()) return setEditError('Email é obrigatório.');
    if (!editForm.phone?.trim()) return setEditError('Telefone é obrigatório.');

    setSaving(true);
    setEditError('');
    try {
      const updated = await updateUserByAdmin(editUser.id, {
        name:         editForm.name.trim(),
        email:        editForm.email.trim(),
        phone:        editForm.phone.trim(),
        pix_key:      editForm.pix_key.trim(),
        pix_key_type: editForm.pix_key_type,
      });
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...updated } : u));
      showToast('Dados do usuário atualizados!');
      closeEdit();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Filtro ───────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === 'Todos' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalAdmins     = users.filter(u => u.role === 'admin').length;
  const totalVendedores = users.filter(u => u.role === 'vendedor').length;
  const totalUsers      = users.filter(u => u.role === 'user').length;

  return (
    <div className="gu-page">
      <PageHero title="Gestão de Usuários" subtitle="Visualize e gerencie os dados e papéis de todos os usuários" />

      <div className="gu-content">

        {!loading && !error && (
          <div className="gu-stats">
            <div className="gu-stat">
              <span className="gu-stat-val">{users.length}</span>
              <span className="gu-stat-lbl">Total</span>
            </div>
            <div className="gu-stat gu-stat--admin">
              <span className="gu-stat-val">{totalAdmins}</span>
              <span className="gu-stat-lbl">Admins</span>
            </div>
            <div className="gu-stat gu-stat--vendedor">
              <span className="gu-stat-val">{totalVendedores}</span>
              <span className="gu-stat-lbl">Vendedores</span>
            </div>
            <div className="gu-stat gu-stat--user">
              <span className="gu-stat-val">{totalUsers}</span>
              <span className="gu-stat-lbl">Usuários</span>
            </div>
          </div>
        )}

        <div className="gu-filters">
          <div className="gu-search-wrap">
            <svg className="gu-search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="gu-search"
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="gu-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option>Todos</option>
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
            <option value="user">Usuário</option>
          </select>
        </div>

        {loading && (
          <div className="gu-list">
            {[...Array(5)].map((_, i) => <div key={i} className="gu-skeleton" />)}
          </div>
        )}

        {error && (
          <div className="gu-empty">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="gu-empty"><p>Nenhum usuário encontrado.</p></div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="gu-list">
            {filtered.map(u => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.id === currentUser.id}
                isUpdatingRole={updatingRole === u.id}
                roleFeedback={roleFeedback?.id === u.id ? roleFeedback.ok : null}
                onRoleChange={handleRoleChange}
                onEdit={() => openEdit(u)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de edição ── */}
      {editUser && (
        <div className="gu-modal-overlay" onClick={closeEdit}>
          <div className="gu-modal" onClick={e => e.stopPropagation()}>
            <div className="gu-modal-header">
              <h2 className="gu-modal-title">Editar usuário</h2>
              <button className="gu-modal-close" onClick={closeEdit} aria-label="Fechar">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form className="gu-modal-form" onSubmit={handleSaveEdit} noValidate>
              <div className="gu-modal-fields">

                <div className="gu-field">
                  <label className="gu-label">Nome</label>
                  <input className="gu-input" type="text" value={editForm.name} onChange={setField('name')} maxLength={150} />
                </div>

                <div className="gu-field">
                  <label className="gu-label">Email</label>
                  <input className="gu-input" type="email" value={editForm.email} onChange={setField('email')} />
                </div>

                <div className="gu-field">
                  <label className="gu-label">Telefone</label>
                  <input className="gu-input" type="text" value={editForm.phone} onChange={setField('phone')} maxLength={20} />
                </div>

                <div className="gu-field-row">
                  <div className="gu-field">
                    <label className="gu-label">Tipo de chave PIX</label>
                    <select className="gu-select" value={editForm.pix_key_type} onChange={setField('pix_key_type')}>
                      {PIX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="gu-field">
                    <label className="gu-label">Chave PIX</label>
                    <input className="gu-input" type="text" value={editForm.pix_key} onChange={setField('pix_key')} maxLength={255} />
                  </div>
                </div>

              </div>

              {editError && (
                <div className="gu-modal-error">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                  </svg>
                  {editError}
                </div>
              )}

              <div className="gu-modal-actions">
                <button type="button" className="gu-btn-cancel" onClick={closeEdit} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="gu-btn-save" disabled={saving}>
                  {saving ? (
                    <>
                      <svg className="gu-spinner" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15"/>
                      </svg>
                      Salvando...
                    </>
                  ) : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, isSelf, isUpdatingRole, roleFeedback, onRoleChange, onEdit }) {
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className={`gu-row ${isSelf ? 'gu-row--self' : ''}`}>
      <div className="gu-row-avatar"><span>{initials}</span></div>

      <div className="gu-row-info">
        <div className="gu-row-name">
          {user.name}
          {isSelf && <span className="gu-self-badge">Você</span>}
        </div>
        <div className="gu-row-email">{user.email}</div>
        <div className="gu-row-meta">
          <span className="gu-row-phone">{user.phone}</span>
          <span className="gu-row-since">
            desde {new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="gu-row-role-wrap">
        <span className={`gu-role-badge ${ROLE_CLASS[user.role]}`}>
          {ROLE_LABEL[user.role]}
        </span>

        <div className="gu-row-actions">
          <button className="gu-btn-edit" onClick={onEdit} title="Editar dados">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            Editar
          </button>

          {!isSelf && (
            <div className="gu-role-select-wrap">
              <select
                className="gu-role-select"
                value={user.role}
                disabled={isUpdatingRole}
                onChange={e => onRoleChange(user.id, e.target.value)}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
              {isUpdatingRole && (
                <svg className="gu-spinner" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15"/>
                </svg>
              )}
              {roleFeedback === true && (
                <svg className="gu-feedback gu-feedback--ok" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                </svg>
              )}
              {roleFeedback === false && (
                <svg className="gu-feedback gu-feedback--err" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
