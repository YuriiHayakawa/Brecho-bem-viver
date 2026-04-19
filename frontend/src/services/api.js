const BASE_URL = 'http://localhost:8000';

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

// ── Produtos ──────────────────────────────────────────
export async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/products/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar produtos');
  return data;
}

export async function fetchMyProducts(userId) {
  const response = await fetch(`${BASE_URL}/products/?user_id=${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao buscar seus produtos');
  return data;
}

export async function updateProduct(id, payload) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar produto');
  return data;
}

export async function fetchProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Produto não encontrado');
  return data;
}

export async function reserveProduct(productId, userId) {
  const response = await fetch(`${BASE_URL}/products/${productId}/reserve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao reservar produto');
  return data;
}

export async function createProduct(payload) {
  const response = await fetch(`${BASE_URL}/products/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao criar produto');
  return data;
}

export async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${BASE_URL}/products/${productId}/images`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Erro ao enviar imagem');
  return data;
}
