/**
 * Marca "Brechó Bem Viver" — varal de roupas dentro de um círculo aberto,
 * com coração e folhas. Vetorizada a partir da identidade visual do evento.
 * `tone="brand"` para fundos claros, `tone="light"` para fundos verde-escuro.
 */
export function LogoMark({ size = 40, tone = 'brand', className = '' }) {
  const palettes = {
    brand: {
      ring: '#2C4631',
      rod: '#2C4631',
      dress: '#DE9270',
      shirt: '#4C6B4F',
      bag: '#D9BE93',
      heart: '#DE9270',
      leaf: '#5C7C57',
    },
    light: {
      ring: '#F6F1E7',
      rod: '#F6F1E7',
      dress: '#E7A783',
      shirt: '#CFE0C6',
      bag: '#F6F1E7',
      heart: '#E7A783',
      leaf: '#BFD6B6',
    },
  };
  const c = palettes[tone] || palettes.brand;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* anel aberto */}
      <path
        d="M72 20 A46 46 0 1 1 40 20"
        stroke={c.ring}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* folhas */}
      <path d="M16 74c6 2 11 7 13 13" stroke={c.leaf} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="17" cy="71" rx="6" ry="3.2" fill={c.leaf} transform="rotate(-30 17 71)" />
      <ellipse cx="24" cy="80" rx="6" ry="3.2" fill={c.leaf} transform="rotate(20 24 80)" />
      <ellipse cx="30" cy="89" rx="5.5" ry="3" fill={c.leaf} transform="rotate(45 30 89)" />

      {/* varão */}
      <line x1="32" y1="38" x2="96" y2="34" stroke={c.rod} strokeWidth="3.5" strokeLinecap="round" />

      {/* vestido */}
      <path d="M45 38l-4 6h8l-4-6z" stroke={c.ring} strokeWidth="2" fill="none" />
      <path d="M39 44c-3 3-5 9-4 15l4 20h12l4-20c1-6-1-12-4-15z" fill={c.dress} />

      {/* camisa */}
      <path d="M63 38l-4 5h8l-4-5z" stroke={c.ring} strokeWidth="2" fill="none" />
      <path d="M55 45l-6 6 4 5 5-3v26h10V53l5 3 4-5-6-6c-2 2-14 2-16 0z" fill={c.shirt} />

      {/* bolsa */}
      <path d="M74 40c0-5 4-9 8-9s8 4 8 9" stroke={c.ring} strokeWidth="2.4" fill="none" />
      <path d="M73 41h18l3 22H70z" fill={c.bag} />

      {/* coração */}
      <path
        d="M60 100c-9-6-15-11-15-18 0-5 4-8 8-8 3 0 6 2 7 5 1-3 4-5 7-5 4 0 8 3 8 8 0 7-6 12-15 18z"
        fill={c.heart}
      />
    </svg>
  );
}

export default LogoMark;
