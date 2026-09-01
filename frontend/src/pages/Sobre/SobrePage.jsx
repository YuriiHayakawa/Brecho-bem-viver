import PageHero from '../../components/PageHero/PageHero';
import { LogoMark } from '../../components/Logo/Logo';
import './SobrePage.css';

const PILARES = [
  {
    titulo: 'Sustentabilidade',
    descricao: 'Dar nova vida a roupas e acessórios, reduzindo o desperdício e promovendo o consumo consciente.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 3.5C7 5 5 7.5 5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    titulo: 'Empreendedorismo',
    descricao: 'Empoderar colaboradores e empreendedores a gerar renda extra com seus próprios produtos.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    titulo: 'Comunidade',
    descricao: 'Fortalecer os laços entre as pessoas da empresa, criando um ambiente de troca e solidariedade.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 19c0-3 2.7-5 6-5M21 19c0-3-2.7-5-6-5M9 14c1 0 2 .2 3 .5 1-.3 2-.5 3-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function SobrePage() {
  return (
    <main className="sobre-page">

        <PageHero title="Sobre o Brechó Bem Viver" subtitle="Desapega. Compartilha. Transforma. Uma iniciativa que une sustentabilidade, acolhimento e comunidade." />

        <div className="sobre-content">

          {/* Descrição */}
          <section className="sobre-section sobre-descricao-section">
            <div className="sobre-descricao-card">
              <p>
                O <strong>Brechó Bem Viver</strong> é uma plataforma interna de compra e venda de
                roupas, acessórios e outros itens entre colaboradores e empreendedores conectados
                à empresa. Surgiu da necessidade de criar um espaço seguro, transparente e
                organizado para essas trocas.
              </p>
              <p>
                Acreditamos que cada peça tem uma nova história para contar. Por isso,
                facilitamos a conexão entre quem quer vender e quem quer comprar — de forma
                simples, direta e sem intermediários.
              </p>
            </div>
          </section>

          {/* Pilares */}
          <section className="sobre-section">
            <h2 className="sobre-section-title">Nossos pilares</h2>
            <div className="sobre-pilares">
              {PILARES.map((p) => (
                <div className="pilar-card" key={p.titulo}>
                  <div className="pilar-icon">{p.icon}</div>
                  <h3 className="pilar-titulo">{p.titulo}</h3>
                  <p className="pilar-descricao">{p.descricao}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Rodapé institucional */}
          <section className="sobre-institucional">
            <LogoMark size={34} />
            <div>
              <p className="sobre-inst-nome">Brechó Bem Viver</p>
              <p className="sobre-inst-slogan">
                Sustentável para o planeta. Leve para você. Bom para todos.
              </p>
            </div>
          </section>

        </div>
      </main>
  );
}
