// Listas usadas no cadastro/edição de produto e no filtro do catálogo

// Ordem alfabética, com "Outros" sempre no fim
export const CATEGORIES = [
  'Acessórios', 'Blazers', 'Blusas', 'Bolsas', 'Brinquedos', 'Calçados',
  'Calças', 'Camisas', 'Camisetas', 'Casacos', 'Conjuntos', 'Jaquetas',
  'Moda praia', 'Saias', 'Shorts', 'Vestidos',
  'Outros',
];

// Ordena nomes de categoria em ordem alfabética (pt-BR), mantendo "Outros" no fim
export function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    if (a === 'Outros') return 1;
    if (b === 'Outros') return -1;
    return a.localeCompare(b, 'pt-BR');
  });
}

export const GENDERS = [
  { value: 'feminino',  label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'unissex',   label: 'Unissex' },
  { value: 'infantil',  label: 'Infantil' },
];

// Numeração em sequência: numberRange(25, 27) → ['25', '26', '27']
const numberRange = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

export const ADULT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', 'Único', ...numberRange(25, 44)];

// Roupa de bebê por sigla + numeração de calçado infantil (16 a 33)
export const CHILD_SIZES = ['RN', 'P', 'M', 'G', ...numberRange(16, 33)];

export function sizesForGender(gender) {
  return gender === 'infantil' ? CHILD_SIZES : ADULT_SIZES;
}
