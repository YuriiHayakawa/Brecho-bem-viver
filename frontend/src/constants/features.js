// Liga/desliga funcionalidades da interface sem apagar código.

// Reserva direta de produtos (botão "Reservar", tela "Minhas Reservas", textos
// de reserva). Desativada na 1ª edição do bazar, que é presencial. Todo o fluxo
// continua funcionando no backend — para reativar na 2ª edição, basta trocar
// para true. Propostas aceitas continuam reservando a peça mesmo com isto em false.
export const RESERVAS_ATIVAS = false;

// Bazar encerrado: com true, QUALQUER endereço do site mostra só a página de
// encerramento (pages/Encerrado) e nenhuma chamada é feita à API — por isso o
// site pode ficar no ar com o backend desligado. Ligado ao fim da 1ª edição
// (novembro/2026). Para reabrir: religar o backend (Railway) e trocar para false.
export const BAZAR_ENCERRADO = true;
