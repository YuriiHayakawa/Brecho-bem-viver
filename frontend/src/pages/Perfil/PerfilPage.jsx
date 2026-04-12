import Navbar from '../../components/Navbar/Navbar';
import './PerfilPage.css';

const PIX_LABELS = {
  telefone: 'Telefone',
  email: 'E-mail',
  cpf: 'CPF',
  aleatoria: 'Chave Aleatória',
};

export default function PerfilPage() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <>
      <Navbar />
      <main className="perfil-page">

        {/* Hero */}
        <div className="perfil-hero">
          <div className="perfil-hero-diagonal" />
          <div className="perfil-hero-inner">
            <div className="perfil-avatar-big">
              <span>{initials}</span>
            </div>
            <div className="perfil-hero-info">
              <h1 className="perfil-name">{user.name || '—'}</h1>
              <span className={`perfil-role-badge role-${user.role}`}>
                {user.role === 'admin' ? 'Administrador' : user.role === 'vendedor' ? 'Vendedor' : 'Usuário'}
              </span>
            </div>
          </div>
        </div>

        {/* Cards de dados */}
        <div className="perfil-content">
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
                <DataRow label="E-mail" value={user.email} />
                <DataRow label="Telefone" value={user.phone} />
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
                <DataRow
                  label="Tipo de chave"
                  value={PIX_LABELS[user.pix_key_type] || user.pix_key_type}
                />
                <DataRow label="Chave PIX" value={user.pix_key} mono />
              </div>
            </section>

          </div>
        </div>

      </main>
    </>
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
