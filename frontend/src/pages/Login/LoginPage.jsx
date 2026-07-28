import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, fetchCurrentUser } from '../../services/api';
import { UNITS } from '../../constants/units';
import './LoginPage.css';

const PIX_TYPES = [
  { value: 'telefone', label: 'Telefone' },
  { value: 'email',    label: 'E-mail' },
  { value: 'cpf',      label: 'CPF' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
];

const PIX_PLACEHOLDER = {
  telefone:  '(61) 99999-9999',
  email:     'seupix@email.com',
  cpf:       '000.000.000-00',
  aleatoria: '00000000-0000-0000-0000-000000000000',
};

function applyMask(value, type) {
  const digits = value.replace(/\D/g, '');
  if (type === 'telefone') {
    if (digits.length <= 10)
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  if (type === 'cpf') {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
      .slice(0, 14);
  }
  return value;
}

function applyPhoneMask(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10)
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
}

// ─────────────────────────────────────────────
export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  function switchTo(m) {
    setMode(m);
  }

  return (
    <div className="login-wrapper">
      {/* Painel esquerdo — identidade Sebrae */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="sebrae-bars top-bars">
            <span className="bar bar-1" /><span className="bar bar-2" />
            <span className="bar bar-3" /><span className="bar bar-4" />
          </div>

          <div className="brand-logo">
            <div className="logo-symbol">
              <span className="logo-bar s1" /><span className="logo-bar s2" />
              <span className="logo-bar s3" /><span className="logo-bar s4" />
            </div>
            <div className="logo-text">
              <span className="logo-name">SEBRAE</span>
              <span className="logo-subtitle">Bazar</span>
            </div>
          </div>

          <div className="brand-divider" />

          <p className="brand-slogan">
            A força do<br />empreendedor<br />brasileiro.
          </p>

          <div className="sebrae-bars bottom-bars">
            <span className="bar bar-4" /><span className="bar bar-3" />
            <span className="bar bar-2" /><span className="bar bar-1" />
          </div>
        </div>
        <div className="brand-diagonal" />
      </div>

      {/* Painel direito */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Logo mobile */}
          <div className="mobile-logo">
            <div className="mobile-logo-bars">
              <span className="bar bar-1" /><span className="bar bar-2" /><span className="bar bar-3" />
            </div>
            <span className="mobile-logo-name">SEBRAE Bazar</span>
          </div>

          {/* Abas login / cadastro */}
          <div className="form-tabs">
            <button
              className={`form-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchTo('login')}
            >
              Entrar
            </button>
            <button
              className={`form-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchTo('register')}
            >
              Criar conta
            </button>
          </div>

          {mode === 'login'
            ? <LoginForm />
            : <RegisterForm onSuccess={() => switchTo('login')} />
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await loginUser(email, password);
      sessionStorage.setItem('token', access_token);
      const user = await fetchCurrentUser();
      sessionStorage.setItem('user', JSON.stringify(user));
      navigate('/catalogo');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="form-header">
        <h1 className="form-title">Bem-vindo de volta</h1>
        <p className="form-subtitle">Entre com sua conta para acessar o painel</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <Field label="E-mail" id="email">
          <div className="field-input-wrapper">
            <IconEmail />
            <input id="email" type="email" className="field-input" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
        </Field>

        <Field label="Senha" id="password">
          <div className="field-input-wrapper">
            <IconLock />
            <input id="password" type={showPassword ? 'text' : 'password'}
              className="field-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password" />
            <TogglePassword show={showPassword} onClick={() => setShowPassword(v => !v)} />
          </div>
        </Field>

        {error && <ErrorMsg message={error} />}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? <LoadingSpinner label="Entrando..." /> : 'Entrar'}
        </button>
      </form>

      <p className="form-footer">
        Serviço Brasileiro de Apoio às<br />Micro e Pequenas Empresas
      </p>
    </>
  );
}

// ─────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', unit: '', pix_key_type: 'telefone', pix_key: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return e => {
      let value = e.target.value;
      if (field === 'phone') value = applyPhoneMask(value);
      if (field === 'pix_key') value = applyMask(value, form.pix_key_type);
      if (field === 'pix_key_type') {
        setForm(f => ({ ...f, pix_key_type: value, pix_key: '' }));
        return;
      }
      setForm(f => ({ ...f, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        unit: form.unit,
        pix_key: form.pix_key,
        pix_key_type: form.pix_key_type,
      });
      // Loga automaticamente após o cadastro
      const { access_token } = await loginUser(form.email, form.password);
      sessionStorage.setItem('token', access_token);
      const user = await fetchCurrentUser();
      sessionStorage.setItem('user', JSON.stringify(user));
      navigate('/catalogo');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="form-header">
        <h1 className="form-title">Criar sua conta</h1>
        <p className="form-subtitle">Preencha os dados para se cadastrar como vendedor</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form register-form" noValidate>
        <Field label="Nome completo" id="name">
          <div className="field-input-wrapper">
            <IconUser />
            <input id="name" type="text" className="field-input" placeholder="Seu nome completo"
              value={form.name} onChange={set('name')} required />
          </div>
        </Field>

        <Field label="E-mail" id="reg-email">
          <div className="field-input-wrapper">
            <IconEmail />
            <input id="reg-email" type="email" className="field-input" placeholder="seu@email.com"
              value={form.email} onChange={set('email')} required autoComplete="off" />
          </div>
        </Field>

        <div className="field-row">
          <Field label="Senha" id="reg-password">
            <div className="field-input-wrapper">
              <IconLock />
              <input id="reg-password" type={showPassword ? 'text' : 'password'}
                className="field-input" placeholder="Mínimo 6 caracteres"
                value={form.password} onChange={set('password')} required autoComplete="new-password" />
              <TogglePassword show={showPassword} onClick={() => setShowPassword(v => !v)} />
            </div>
          </Field>

          <Field label="Confirmar senha" id="confirm-password">
            <div className="field-input-wrapper">
              <IconLock />
              <input id="confirm-password" type={showPassword ? 'text' : 'password'}
                className="field-input" placeholder="Repita a senha"
                value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          </Field>
        </div>

        <Field label="Telefone" id="phone">
          <div className="field-input-wrapper">
            <IconPhone />
            <input id="phone" type="tel" className="field-input" placeholder="(61) 99999-9999"
              value={form.phone} onChange={set('phone')} required />
          </div>
        </Field>

        <Field label="Área" id="unit">
          <div className="field-input-wrapper select-wrapper">
            <IconBuilding />
            <select id="unit" className="field-input field-select"
              value={form.unit} onChange={set('unit')} required>
              <option value="" disabled>Selecione sua área</option>
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </Field>

        <div className="field-row">
          <Field label="Tipo de chave PIX" id="pix_key_type">
            <div className="field-input-wrapper select-wrapper">
              <IconPix />
              <select id="pix_key_type" className="field-input field-select"
                value={form.pix_key_type} onChange={set('pix_key_type')}>
                {PIX_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Chave PIX" id="pix_key">
            <div className="field-input-wrapper">
              <IconKey />
              <input id="pix_key" type="text" className="field-input"
                placeholder={PIX_PLACEHOLDER[form.pix_key_type]}
                value={form.pix_key} onChange={set('pix_key')} required />
            </div>
          </Field>
        </div>

        {error && <ErrorMsg message={error} />}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? <LoadingSpinner label="Criando conta..." /> : 'Criar conta'}
        </button>
      </form>
    </>
  );
}

// ─────────────────────────────────────────────
// Componentes auxiliares
// ─────────────────────────────────────────────

function Field({ label, id, children }) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
    </div>
  );
}

function ErrorMsg({ message }) {
  return (
    <div className="error-message" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

function LoadingSpinner({ label }) {
  return (
    <span className="btn-loading">
      <svg className="spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15" />
      </svg>
      {label}
    </span>
  );
}

function TogglePassword({ show, onClick }) {
  return (
    <button type="button" className="toggle-password" onClick={onClick}
      aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
      {show ? (
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M3 3l14 14M8.5 8.7A3 3 0 0011.3 11.5M6.2 6.3A8 8 0 002 10s2.5 5 8 5c1.5 0 2.8-.4 4-1M9 5.1C9.3 5 9.6 5 10 5c5.5 0 8 5 8 5a13 13 0 01-2 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M2 10s2.5-5 8-5 8 5 8 5-2.5 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}

// ── Ícones ──
const IconEmail = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 6.5L10 11.5L17.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconLock = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconUser = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconPhone = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <path d="M4 2h4l1.5 4-2 1.5c1 2 2.5 3.5 4.5 4.5L13.5 10 18 11.5V16a2 2 0 01-2 2C6 18 2 10 2 4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconBuilding = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="2.5" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 6h2M7 9h2M7 12h2M11 6h2M11 9h2M11 12h2M8.5 17.5v-3h3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconPix = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L14 6H11V14H14L10 18L6 14H9V6H6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IconKey = () => (
  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
    <circle cx="8" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 10h6M15 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
