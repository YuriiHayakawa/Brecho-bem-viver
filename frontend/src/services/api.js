import { compressImage } from '../utils/image';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Helpers de token ───────────────────────────────────
export function getToken() {
  return sessionStorage.getItem('token');
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Helpers de erro ───────────────────────────────────
// Nome amigável dos campos enviados à API, usado nas mensagens de validação
const FIELD_LABELS = {
  name: 'Nome', email: 'E-mail', password: 'Senha', phone: 'Telefone', unit: 'Unidade',
  pix_key: 'Chave PIX', pix_key_type: 'Tipo de chave PIX', role: 'Permissão',
  description: 'Descrição', defect_description: 'Descrição do defeito', brand: 'Marca',
  category: 'Categoria', size: 'Tamanho', gender: 'Gênero', price: 'Preço',
  offered_price: 'Valor da oferta', counter_price: 'Valor da contraproposta', message: 'Mensagem',
  sale_value: 'Valor da venda', buyer_name: 'Nome do comprador', buyer_phone: 'Telefone do comprador',
  product_code: 'Código do produto',
};

// Converte o corpo de erro da API em uma mensagem legível. Erros de validação
// do FastAPI (422) chegam como uma lista de objetos — passar isso direto para
// new Error() exibia "[object Object]" na tela.
function errorMessage(data, fallback) {
  const detail = data?.detail;
  if (typeof detail === 'string' && detail) return detail;

  if (Array.isArray(detail) && detail.length) {
    const { loc = [], type } = detail[0];
    const field = loc[loc.length - 1];
    const label = FIELD_LABELS[field];
    if (field === 'email') return 'Informe um e-mail válido.';
    if (label && type === 'missing') return `Preencha o campo "${label}".`;
    if (label) return `Confira o campo "${label}".`;
  }

  return fallback;
}

// Lê o JSON da resposta sem quebrar quando o corpo não é JSON
// (ex.: página de erro HTML do servidor ou do proxy durante uma instabilidade).
async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// Wrapper de fetch: em qualquer chamada autenticada que volte 401,
// encerra a sessão expirada e redireciona para o login.
async function apiFetch(input, init) {
  let response;
  try {
    response = await fetch(input, init);
  } catch {
    // fetch só rejeita quando não chega resposta (sem internet, servidor fora do ar)
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
  }

  if (response.status === 401 && init?.headers?.Authorization) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
}

// ── Auth ──────────────────────────────────────────────
export async function registerUser({ name, email, password, phone, unit, pix_key, pix_key_type }) {
  const response = await apiFetch(`${BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, unit, pix_key, pix_key_type }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao criar conta'));
  return data;
}

// Retorna { access_token, token_type }
export async function loginUser(email, password) {
  const response = await apiFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao fazer login'));
  return data;
}

// Busca o usuário autenticado pelo token (usado após login)
export async function fetchCurrentUser() {
  const response = await apiFetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Sessão inválida ou expirada'));
  return data;
}

// ── Perfil do usuário logado ──────────────────────────
export async function fetchMyProfile() {
  const response = await apiFetch(`${BASE_URL}/users/me`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar perfil'));
  return data;
}

// Campos editáveis: name, phone, pix_key, pix_key_type
export async function updateMyProfile(payload) {
  const response = await apiFetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao atualizar perfil'));
  return data;
}

// ── Relatórios ────────────────────────────────────────
export async function fetchMyReport() {
  const response = await apiFetch(`${BASE_URL}/reports/me`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar relatório'));
  return data;
}

// ── Produtos ──────────────────────────────────────────
export async function fetchProducts() {
  const response = await apiFetch(`${BASE_URL}/products/`);
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar produtos'));
  return data;
}

// Lista produtos do usuário logado usando user_id como filtro
export async function fetchMyProducts(userId) {
  const response = await apiFetch(`${BASE_URL}/products/?user_id=${userId}`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar seus produtos'));
  return data;
}

export async function fetchProduct(id) {
  const response = await apiFetch(`${BASE_URL}/products/${id}`);
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Produto não encontrado'));
  return data;
}

// Não enviar id_user — o backend obtém o dono pelo token
export async function createProduct(payload) {
  const { id_user, ...safePayload } = payload; // garante que id_user nunca vai no body
  const response = await apiFetch(`${BASE_URL}/products/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(safePayload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao criar produto'));
  return data;
}

export async function updateProduct(id, payload) {
  const response = await apiFetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao atualizar produto'));
  return data;
}

export async function deleteProduct(id) {
  const response = await apiFetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  if (!response.ok) {
    const data = await readJson(response);
    throw new Error(errorMessage(data, 'Erro ao deletar produto'));
  }
}

// Não enviar user_id — o backend usa o usuário logado pelo token
export async function reserveProduct(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/reserve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao reservar produto'));
  return data;
}

// Comprador desiste da própria reserva (só reservas diretas; as de proposta aceita não podem)
export async function cancelReservation(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/cancel-reservation`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao cancelar reserva'));
  return data;
}

export async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiFetch(`${BASE_URL}/products/${productId}/images`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: formData,
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao enviar imagem'));
  return data;
}

// Envia várias fotos em sequência (já reduzidas no navegador) sem parar na
// primeira falha. Retorna { uploaded, failed } — failed com os índices das que
// não subiram —, para a tela não recriar o produto nem reenviar as que já subiram.
// onProgress(n, total) é chamado antes de cada foto.
export async function uploadProductImages(productId, files, onProgress) {
  const uploaded = [];
  const failed = [];
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    try {
      const file = await compressImage(files[i]);
      uploaded.push(await uploadProductImage(productId, file));
    } catch {
      failed.push(i);
    }
  }
  return { uploaded, failed };
}

export async function fetchProductImages(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/images`);
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar imagens'));
  return data;
}

// ── Admin ──────────────────────────────────────────────
export async function fetchAdminSummary() {
  const response = await apiFetch(`${BASE_URL}/reports/admin/summary`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar resumo admin'));
  return data;
}

export async function fetchAdminRemainingProducts(name = '') {
  const qs = name ? `?name=${encodeURIComponent(name)}` : '';
  const response = await apiFetch(`${BASE_URL}/reports/admin/remaining-products${qs}`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar produtos admin'));
  return data;
}

export async function createSale(payload) {
  const response = await apiFetch(`${BASE_URL}/sales/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao registrar venda'));
  return data;
}

// ── Admin: Gestão de Usuários ──────────────────────────
export async function fetchAllUsers() {
  const response = await apiFetch(`${BASE_URL}/users/`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar usuários'));
  return data;
}

export async function updateUserByAdmin(userId, payload) {
  const response = await apiFetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao atualizar usuário'));
  return data;
}

export async function updateUserRole(userId, role) {
  const response = await apiFetch(`${BASE_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ role }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao atualizar role'));
  return data;
}

export async function fetchProductLabelData(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/label-data`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar dados da etiqueta'));
  return data;
}

// ── Ofertas / Propostas ────────────────────────────────
// payload: { offered_price, message? }
export async function createOffer(productId, payload) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao enviar oferta'));
  return data;
}

// Propostas que EU enviei (sou comprador)
export async function fetchSentOffers() {
  const response = await apiFetch(`${BASE_URL}/offers/sent`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar suas propostas'));
  return data;
}

// Propostas que EU recebi (sou dono do produto)
export async function fetchReceivedOffers() {
  const response = await apiFetch(`${BASE_URL}/offers/received`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar propostas recebidas'));
  return data;
}

export async function acceptOffer(offerId) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/accept`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao aceitar proposta'));
  return data;
}

export async function rejectOffer(offerId) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao recusar proposta'));
  return data;
}

// Vendedor envia contraproposta. payload: { counter_price, message? }
export async function counterOffer(offerId, payload) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/counter`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao enviar contraproposta'));
  return data;
}

// Comprador aceita a contraproposta do vendedor
export async function acceptCounterOffer(offerId) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/counter/accept`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao aceitar contraproposta'));
  return data;
}

// Comprador recusa a contraproposta do vendedor
export async function rejectCounterOffer(offerId) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/counter/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao recusar contraproposta'));
  return data;
}

// Oferta aceita de um produto (admin — usado no registro da venda)
export async function fetchAcceptedOffer(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/offers/accepted`, {
    headers: { ...authHeader() },
  });
  if (response.status === 404) return null; // nenhuma oferta aceita
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar oferta aceita'));
  return data;
}

// ── Reservas ───────────────────────────────────────────
// Produtos reservados para o usuário logado
export async function fetchMyReservations() {
  const response = await apiFetch(`${BASE_URL}/products/my-reservations`, {
    headers: { ...authHeader() },
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(errorMessage(data, 'Erro ao buscar suas reservas'));
  return data;
}
