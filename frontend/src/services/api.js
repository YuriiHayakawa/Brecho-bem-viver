const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Helpers de token ───────────────────────────────────
export function getToken() {
  return sessionStorage.getItem('token');
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Wrapper de fetch: em qualquer chamada autenticada que volte 401,
// encerra a sessão expirada e redireciona para o login.
async function apiFetch(input, init) {
  const response = await fetch(input, init);

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
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao criar conta');
  return data;
}

// Retorna { access_token, token_type }
export async function loginUser(email, password) {
  const response = await apiFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao fazer login');
  return data;
}

// Busca o usuário autenticado pelo token (usado após login)
export async function fetchCurrentUser() {
  const response = await apiFetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Sessão inválida ou expirada');
  return data;
}

// ── Perfil do usuário logado ──────────────────────────
export async function fetchMyProfile() {
  const response = await apiFetch(`${BASE_URL}/users/me`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar perfil');
  return data;
}

// Campos editáveis: name, phone, pix_key, pix_key_type
export async function updateMyProfile(payload) {
  const response = await apiFetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar perfil');
  return data;
}

// ── Relatórios ────────────────────────────────────────
export async function fetchMyReport() {
  const response = await apiFetch(`${BASE_URL}/reports/me`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar relatório');
  return data;
}

// ── Produtos ──────────────────────────────────────────
export async function fetchProducts() {
  const response = await apiFetch(`${BASE_URL}/products/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar produtos');
  return data;
}

// Lista produtos do usuário logado usando user_id como filtro
export async function fetchMyProducts(userId) {
  const response = await apiFetch(`${BASE_URL}/products/?user_id=${userId}`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar seus produtos');
  return data;
}

export async function fetchProduct(id) {
  const response = await apiFetch(`${BASE_URL}/products/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Produto não encontrado');
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao criar produto');
  return data;
}

export async function updateProduct(id, payload) {
  const response = await apiFetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar produto');
  return data;
}

export async function deleteProduct(id) {
  const response = await apiFetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Erro ao deletar produto');
  }
}

// Não enviar user_id — o backend usa o usuário logado pelo token
export async function reserveProduct(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/reserve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao reservar produto');
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao enviar imagem');
  return data;
}

export async function fetchProductImages(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/images`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar imagens');
  return data;
}

// ── Admin ──────────────────────────────────────────────
export async function fetchAdminSummary() {
  const response = await apiFetch(`${BASE_URL}/reports/admin/summary`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar resumo admin');
  return data;
}

export async function fetchAdminRemainingProducts(name = '') {
  const qs = name ? `?name=${encodeURIComponent(name)}` : '';
  const response = await apiFetch(`${BASE_URL}/reports/admin/remaining-products${qs}`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar produtos admin');
  return data;
}

export async function createSale(payload) {
  const response = await apiFetch(`${BASE_URL}/sales/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao registrar venda');
  return data;
}

// ── Admin: Gestão de Usuários ──────────────────────────
export async function fetchAllUsers() {
  const response = await apiFetch(`${BASE_URL}/users/`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar usuários');
  return data;
}

export async function updateUserByAdmin(userId, payload) {
  const response = await apiFetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar usuário');
  return data;
}

export async function updateUserRole(userId, role) {
  const response = await apiFetch(`${BASE_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar role');
  return data;
}

export async function fetchProductLabelData(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/label-data`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar dados da etiqueta');
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao enviar oferta');
  return data;
}

// Propostas que EU enviei (sou comprador)
export async function fetchSentOffers() {
  const response = await apiFetch(`${BASE_URL}/offers/sent`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar suas propostas');
  return data;
}

// Propostas que EU recebi (sou dono do produto)
export async function fetchReceivedOffers() {
  const response = await apiFetch(`${BASE_URL}/offers/received`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar propostas recebidas');
  return data;
}

export async function acceptOffer(offerId) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/accept`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao aceitar proposta');
  return data;
}

export async function rejectOffer(offerId) {
  const response = await apiFetch(`${BASE_URL}/offers/${offerId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao recusar proposta');
  return data;
}

// Oferta aceita de um produto (admin — usado no registro da venda)
export async function fetchAcceptedOffer(productId) {
  const response = await apiFetch(`${BASE_URL}/products/${productId}/offers/accepted`, {
    headers: { ...authHeader() },
  });
  if (response.status === 404) return null; // nenhuma oferta aceita
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar oferta aceita');
  return data;
}

// ── Reservas ───────────────────────────────────────────
// Produtos reservados para o usuário logado
export async function fetchMyReservations() {
  const response = await apiFetch(`${BASE_URL}/products/my-reservations`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar suas reservas');
  return data;
}
