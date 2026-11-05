// Liga/desliga funcionalidades da interface sem apagar código.

// Reserva direta de produtos (botão "Reservar", tela "Minhas Reservas", textos
// de reserva). Desativada na 1ª edição do bazar, que é presencial. Todo o fluxo
// continua funcionando no backend — para reativar na 2ª edição, basta trocar
// para true. Propostas aceitas continuam reservando a peça mesmo com isto em false.
export const RESERVAS_ATIVAS = false;
