const BASE_URL = 'http://localhost:8000';

// ── Helpers de token ───────────────────────────────────
export function getToken() {
  return sessionStorage.getItem('token');
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────
export async function registerUser({ name, email, password, phone, pix_key, pix_key_type }) {
  const response = await fetch(`${BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, pix_key, pix_key_type }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao criar conta');
  return data;
}

// Retorna { access_token, token_type }
export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
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
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Sessão inválida ou expirada');
  return data;
}

// ── Perfil do usuário logado ──────────────────────────
export async function fetchMyProfile() {
  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar perfil');
  return data;
}

// Campos editáveis: name, phone, pix_key, pix_key_type
export async function updateMyProfile(payload) {
  const response = await fetch(`${BASE_URL}/users/me`, {
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
  const response = await fetch(`${BASE_URL}/reports/me`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar relatório');
  return data;
}

// ── Produtos ──────────────────────────────────────────
export async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/products/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar produtos');
  return data;
}

// Lista produtos do usuário logado usando user_id como filtro
export async function fetchMyProducts(userId) {
  const response = await fetch(`${BASE_URL}/products/?user_id=${userId}`, {
    headers: { ...authHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar seus produtos');
  return data;
}

export async function fetchProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Produto não encontrado');
  return data;
}

// Não enviar id_user — o backend obtém o dono pelo token
export async function createProduct(payload) {
  const { id_user, ...safePayload } = payload; // garante que id_user nunca vai no body
  const response = await fetch(`${BASE_URL}/products/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(safePayload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao criar produto');
  return data;
}

export async function updateProduct(id, payload) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar produto');
  return data;
}

export async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
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
  const response = await fetch(`${BASE_URL}/products/${productId}/reserve`, {
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
  const response = await fetch(`${BASE_URL}/products/${productId}/images`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao enviar imagem');
  return data;
}

export async function fetchProductImages(productId) {
  const response = await fetch(`${BASE_URL}/products/${productId}/images`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar imagens');
  return data;
}

export async function fetchProductLabelData(productId) {
  const response = await fetch(`${BASE_URL}/products/${productId}/label-data`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar dados da etiqueta');
  return data;
}
