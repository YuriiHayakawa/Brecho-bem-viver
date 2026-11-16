import { LogoMark } from '../../components/Logo/Logo';
import './EncerradoPage.css';

// Página exibida em qualquer endereço quando BAZAR_ENCERRADO = true
// (constants/features.js). Não depende da API: funciona com o backend desligado.
export default function EncerradoPage() {
  return (
    <main className="enc-page">
      <div className="enc-diagonal" aria-hidden="true" />

      <div className="enc-content">
        <div className="enc-logo">
          <LogoMark size={72} tone="light" />
          <div className="enc-logo-text">
            <span className="enc-logo-name">Brechó</span>
            <span className="enc-logo-sub">Bem Viver</span>
          </div>
        </div>

        <p className="enc-tagline">
          Desapega<span>.</span> Compartilha<span>.</span> Transforma<span>.</span>
        </p>

        <div className="enc-divider" />

        <h1 className="enc-title">Esta edição foi encerrada</h1>
        <p className="enc-message">
          O Brechó Bem Viver encerrou esta edição. Obrigado a todas as pessoas que desapegaram,
          compraram e ajudaram a transformar peças em novas histórias — até a próxima!
        </p>

        <p className="enc-footer">Brechó Bem Viver · 1ª edição · novembro de 2026</p>

        {/* Crédito de desenvolvimento */}
        <p className="enc-credit">
          <span className="enc-credit-item">Site desenvolvido por <strong>Yuri Hayakawa</strong></span>
          <span className="enc-credit-item">(61) 98511-3050</span>
          <a
            className="enc-credit-item"
            href="https://www.linkedin.com/in/yuri-hayakawa-b8a445307/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </p>
      </div>
    </main>
  );
}
