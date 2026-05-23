import PageHero from '../../components/PageHero/PageHero';
import './OrientacoesPage.css';

const ORIENTACOES = [
  {
    numero: '01',
    titulo: 'Cadastre seus produtos',
    descricao:
      'Adicione seus itens ao bazar com fotos, descrição, tamanho, categoria e preço. Quanto mais completo o cadastro, maiores as chances de venda.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    numero: '02',
    titulo: 'Aguarde a reserva',
    descricao:
      'Compradores podem reservar seu produto por até 48 horas. Durante esse período, o item fica indisponível para outros compradores.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    numero: '03',
    titulo: 'Confirme o pagamento via PIX',
    descricao:
      'O comprador realiza o pagamento diretamente via PIX para a sua chave cadastrada. Confirme o recebimento antes de entregar o produto.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3L16 7H13V17H16L12 21L8 17H11V7H8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    numero: '04',
    titulo: 'Realize a entrega',
    descricao:
      'Combine o local e horário de entrega com o comprador. O bazar acontece em um ambiente presencial — trate tudo com respeito e cordialidade.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    numero: '05',
    titulo: 'Preços e negociação',
    descricao:
      'Os preços são sugeridos pelo vendedor, mas o valor final pode ser negociado presencialmente. O QR Code PIX permite que o comprador insira o valor combinado.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H9l3-3 3 3h-2v4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 7v1M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    numero: '06',
    titulo: 'Produtos com defeito',
    descricao:
      'Seja transparente. Se o produto tiver algum defeito, informe no cadastro. A honestidade fortalece a confiança entre os participantes do bazar.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v4M12 16v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function OrientacoesPage() {
  return (
    <main className="orientacoes-page">

        <PageHero title="Orientações" subtitle="Como participar do Bazar Sebrae como vendedor" />

        {/* Cards */}
        <div className="orientacoes-content">
          <div className="orientacoes-grid">
            {ORIENTACOES.map((item) => (
              <div className="orientacao-card" key={item.numero}>
                <div className="orientacao-numero">{item.numero}</div>
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
              Em caso de dúvidas, entre em contato com a organização do evento.
              O Bazar Sebrae promove o empreendedorismo com responsabilidade e transparência.
            </p>
          </div>
        </div>

      </main>
  );
}
