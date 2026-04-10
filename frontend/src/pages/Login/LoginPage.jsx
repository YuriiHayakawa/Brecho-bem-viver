import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      sessionStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* Painel esquerdo — identidade Sebrae */}
      <div className="login-brand">
        <div className="brand-content">
          {/* Barras gráficas do Sebrae */}
          <div className="sebrae-bars top-bars">
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
            <span className="bar bar-4" />
          </div>

          {/* Logo */}
          <div className="brand-logo">
            <div className="logo-symbol">
              <span className="logo-bar s1" />
              <span className="logo-bar s2" />
              <span className="logo-bar s3" />
              <span className="logo-bar s4" />
            </div>
            <div className="logo-text">
              <span className="logo-name">SEBRAE</span>
              <span className="logo-subtitle">Bazar</span>
            </div>
          </div>

          <div className="brand-divider" />

          <p className="brand-slogan">
            A força do<br />
            empreendedor<br />
            brasileiro.
          </p>

          {/* Barras gráficas inferiores */}
          <div className="sebrae-bars bottom-bars">
            <span className="bar bar-4" />
            <span className="bar bar-3" />
            <span className="bar bar-2" />
            <span className="bar bar-1" />
          </div>
        </div>

        {/* Elemento decorativo diagonal */}
        <div className="brand-diagonal" />
      </div>

      {/* Painel direito — formulário */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Logo pequeno mobile */}
          <div className="mobile-logo">
            <div className="mobile-logo-bars">
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </div>
            <span className="mobile-logo-name">SEBRAE Bazar</span>
          </div>

          <div className="form-header">
            <h1 className="form-title">Bem-vindo de volta</h1>
            <p className="form-subtitle">Entre com sua conta para acessar o painel</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="field-group">
              <label htmlFor="email" className="field-label">E-mail</label>
              <div className="field-input-wrapper">
                <svg className="field-icon" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 6.5L10 11.5L17.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="password" className="field-label">Senha</label>
              <div className="field-input-wrapper">
                <svg className="field-icon" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M3 3l14 14M8.5 8.7A3 3 0 0011.3 11.5M6.2 6.3A8 8 0 002 10s2.5 5 8 5c1.5 0 2.8-.4 4-1M9 5.1C9.3 5 9.6 5 10 5c5.5 0 8 5 8 5a13 13 0 01-2 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M2 10s2.5-5 8-5 8 5 8 5-2.5 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <svg className="spinner" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15"/>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="form-footer">
            Serviço Brasileiro de Apoio às<br />Micro e Pequenas Empresas
          </p>
        </div>
      </div>
    </div>
  );
}
