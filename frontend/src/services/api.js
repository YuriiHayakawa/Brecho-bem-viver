const BASE_URL = 'http://localhost:8000';

// ── Auth ──────────────────────────────────────────────
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
