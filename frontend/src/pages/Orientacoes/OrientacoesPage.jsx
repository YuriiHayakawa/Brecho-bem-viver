import PageHero from '../../components/PageHero/PageHero';
import { RESERVAS_ATIVAS } from '../../constants/features';
import './OrientacoesPage.css';

// enabled: false esconde o cartão (funcionalidade desligada em constants/features.js).
// A numeração dos cartões é calculada pela posição na tela.
const ORIENTACOES = [
  {
    titulo: 'Explore o catálogo',
    descricao:
      'Navegue pelos produtos disponíveis e use os filtros de categoria, gênero e status, ou busque direto por nome ou marca.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    enabled: RESERVAS_ATIVAS,
    titulo: 'Reserve por 24 horas',
    descricao:
      'Encontrou a peça certa? Reserve na página do produto e ela fica separada só pra você por 24 horas, sem risco de outra pessoa levar.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titulo: RESERVAS_ATIVAS ? 'Ou negocie um valor' : 'Negocie um valor',
    descricao:
      'Prefere pagar menos? Envie uma oferta abaixo do preço anunciado. O vendedor pode aceitar, recusar ou propor um valor final — aí é só aceitar ou recusar.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titulo: 'Pague com PIX',
    descricao: RESERVAS_ATIVAS
      ? 'Na página do produto aparece o QR Code (ou a chave) PIX do vendedor. Escaneie, pague o valor combinado e combine onde retirar o item.'
      // Bazar presencial: a peça fica exposta com a etiqueta e o admin registra a venda
      : 'Escolheu a peça no bazar? Escaneie o QR Code PIX da etiqueta (ou da página do produto), pague o valor combinado e avise um admin para registrar a venda.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2L14 6H11V14H14L10 18L6 14H9V6H6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titulo: 'Anuncie seus produtos',
    descricao:
      'Cadastre nome, descrição, categoria, tamanho, marca e preço, e adicione fotos — a primeira vira a capa do anúncio. Simples e rápido.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 4l1-2h4l1 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titulo: 'Seja transparente sobre defeitos',
    descricao:
      'Se a peça tiver algum defeito, marque essa opção e descreva. Isso não afasta compradores — fortalece a confiança em quem vende.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 7v4M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titulo: 'Responda as propostas que você recebe',
    descricao:
      "Alguém fez uma oferta no seu produto? Em 'Propostas Recebidas' você aceita, recusa ou envia uma contraproposta com o valor que topa.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 5l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="3" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    titulo: 'Acompanhe tudo pelo Dashboard',
    descricao:
      'Veja quantos produtos você já anunciou, quantos vendeu, quanto arrecadou e quanto isso já ajudou a doação para instituições parceiras.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    titulo: 'Mantenha seu perfil em dia',
    descricao:
      'Sua unidade e sua chave PIX ficam no seu perfil — são elas que aparecem pra quem compra de você, então mantenha tudo atualizado.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function OrientacoesPage() {
  return (
    <main className="orientacoes-page">

        <PageHero title="Orientações" subtitle="Um passo a passo simples pra comprar, vender e negociar no Brechó Bem Viver" />

        {/* Cards */}
        <div className="orientacoes-content">
          <div className="orientacoes-grid">
            {ORIENTACOES.filter(item => item.enabled !== false).map((item, index) => (
              <div className="orientacao-card" key={item.titulo}>
                <div className="orientacao-numero">{String(index + 1).padStart(2, '0')}</div>
                <div className="orientacao-icon">{item.icon}</div>
                <div className="orientacao-body">
                  <h3 className="orientacao-titulo">{item.titulo}</h3>
                  <p className="orientacao-descricao">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="orientacoes-footer-note">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 9v5M10 7v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p>
              Ficou alguma dúvida sobre como algo funciona por aqui? A página "Sobre" conta mais sobre a
              proposta do Brechó Bem Viver — e lembre-se: parte do valor de cada venda ajuda instituições
              sociais parceiras.
            </p>
          </div>
        </div>

      </main>
  );
}
