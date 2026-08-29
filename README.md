# Bazar Interno

Marketplace interno para colaboradores comprarem, venderem e trocarem roupas e acessórios usados — um bazar solidário digital. Uma parte do valor de cada venda é destinada a instituições sociais parceiras.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Modelo de dados](#modelo-de-dados)
- [Fluxos de negócio](#fluxos-de-negócio)
- [Deploy](#deploy)
- [Notas técnicas importantes](#notas-técnicas-importantes)
- [Branches](#branches)

## Sobre o projeto

Cada colaborador pode cadastrar peças à venda, e qualquer outro colaborador pode navegar pelo catálogo, reservar um item, negociar o preço ou comprá-lo diretamente via PIX. Um painel administrativo acompanha vendas, produtos ativos e arrecadação para doação.

## Funcionalidades

**Todos os usuários**
- Cadastro e login (JWT)
- Catálogo de produtos com busca e filtros (categoria, gênero, tamanho, status)
- Cadastro de produtos com múltiplas fotos (capa + galeria), incluindo aviso de defeito
- Reserva de produto por 24h
- Propostas de valor (oferta abaixo do preço anunciado) e **contraproposta**: o vendedor pode responder com um valor exato em vez de só aceitar/recusar, encerrando a negociação em uma rodada
- Pagamento via PIX com QR Code gerado a partir da chave do vendedor
- Perfil próprio editável (dados pessoais, unidade, chave PIX)
- Dashboard pessoal com total de anúncios, vendidos, ativos e valor arrecadado

**Administradores**
- Dashboard com resumo geral (produtos, vendas, doação estimada) e tabela de todos os produtos, com busca, filtro por status e **filtro por vendedor**
- Registro manual de vendas (calcula automaticamente 10% de doação sugerida)
- Geração de etiqueta de produto (nome, preço, QR Code PIX) para impressão
- Gestão de usuários (editar dados, promover/rebaixar papel admin/usuário)

## Stack tecnológica

**Backend** — `backend/`
- [FastAPI](https://fastapi.tiangolo.com/) + [SQLAlchemy](https://www.sqlalchemy.org/) + PostgreSQL
- Autenticação via JWT (`PyJWT` + `passlib`/bcrypt)
- Upload de imagens para [Cloudinary](https://cloudinary.com/)
- Geração de QR Code PIX (`qrcode` + `Pillow`)

**Frontend** — `frontend/`
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) para as rotas
- `fetch` puro para chamadas HTTP (sem lib de state management) — tudo centralizado em `src/services/api.js`

## Estrutura do repositório

```
Bazar-Sebrae/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # endpoints HTTP (users, products, offers, sales, reports...)
│   │   ├── api/deps/         # dependências de auth (get_current_user, require_admin)
│   │   ├── core/             # config (env vars) e segurança (hash, JWT)
│   │   ├── models/           # tabelas SQLAlchemy
│   │   ├── schemas/          # schemas Pydantic (request/response)
│   │   ├── services/         # regra de negócio (uma camada por recurso)
│   │   ├── scripts/          # seed de usuários/produtos fake
│   │   └── main.py           # criação do app, CORS, registro das rotas
│   ├── requirements.txt
│   └── migration_*.sql       # migrations manuais (ver Notas técnicas)
├── frontend/
│   └── src/
│       ├── pages/            # uma pasta por tela (Catalogo, Dashboard, Perfil...)
│       ├── components/       # Navbar, Layout, Toast, PageHero
│       ├── services/api.js   # todas as chamadas à API
│       ├── contexts/         # ToastContext
│       └── constants/        # listas fixas (ex.: unidades da empresa)
├── docker-compose.yml         # PostgreSQL local para desenvolvimento
└── railway.toml                # config de deploy do backend no Railway
```

## Como rodar localmente

### Pré-requisitos
- Python 3.10+
- Node.js LTS + npm
- PostgreSQL (local, ou via Docker)

### 1. Banco de dados

Opção rápida com Docker:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL em `localhost:5432` (banco `bazar_sebrae`, usuário/senha `postgres`). Se preferir, use uma instância PostgreSQL já instalada — só ajuste a `DATABASE_URL`.

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows (PowerShell)
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
cp .env.example .env            # preencha as variáveis (ver seção abaixo)

uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

As tabelas são criadas automaticamente na primeira execução (`Base.metadata.create_all`). Opcionalmente, popule dados de teste:

```bash
python -m app.scripts.seed_users
python -m app.scripts.seed_products
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173`. Sem configuração extra, ele já aponta para `http://localhost:8000` (fallback padrão em `src/services/api.js`); para apontar para outra API, crie um `.env` com `VITE_API_URL=...`.

## Variáveis de ambiente

Definidas em `backend/.env` (veja `backend/.env.example`):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `SECRET_KEY` | Chave para assinar os tokens JWT |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciais do Cloudinary — **obrigatórias**, o backend não inicializa sem elas |
| `ALLOWED_ORIGINS` | Origens liberadas no CORS, separadas por vírgula |
| `APP_NAME`, `APP_ENV`, `APP_PORT` | Opcionais, têm valor padrão |

## Modelo de dados

Tabelas principais (`backend/app/models/`):

- **`users`** — dados pessoais, chave PIX e `role` (`admin` / `user`; `vendedor` existe no banco mas não é mais usado pelo frontend)
- **`products`** — anúncio: preço, categoria, tamanho, `status` (`disponivel` / `reservada` / `vendida`), dono (`id_user`), reserva (`reserved_until`, `reserved_by_user_id`)
- **`product_images`** — fotos do produto, com `is_cover` e `position`
- **`product_offers`** — propostas de valor: comprador, vendedor, `offered_price`, `status` (`pending` / `countered` / `accepted` / `rejected` / `cancelled`), e `counter_price`/`counter_message` quando o vendedor contrapropõe
- **`sales`** — venda registrada pelo admin, vinculada a um produto, com valor de doação sugerida calculado automaticamente

## Fluxos de negócio

- **Reserva (24h):** ao reservar ou ter uma oferta/contraproposta aceita, o produto fica `reservada` por 24h. Não há job/cron: a expiração é feita de forma preguiçosa (`release_expired_reservations`), verificada no início da maioria das rotas de leitura de produtos/ofertas.
- **Oferta e contraproposta:** o comprador propõe um valor abaixo do anunciado. O vendedor pode aceitar, recusar, ou enviar **uma** contraproposta com o valor exato que quer — a partir daí o comprador só pode aceitar ou recusar essa contraproposta (sem novas rodadas).
- **Venda:** registrada manualmente pelo admin a partir do código do produto (`BZR-XXXX`). Calcula automaticamente 10% de doação sugerida sobre o valor da venda. Se a venda veio de uma proposta/contraproposta aceita, o valor já vem pré-preenchido com o valor negociado.

## Deploy

- **Backend** → [Railway](https://railway.app/), a partir da pasta `backend/`, branch `main` (`railway.toml` + `Procfile`)
- **Frontend** → [Vercel](https://vercel.com/), a partir da pasta `frontend/`, branch `main`
- Imagens de produto vão para o Cloudinary em produção; `backend/uploads/` é usado só em desenvolvimento local (gitignored)

## Notas técnicas importantes

- **Sem ferramenta de migration (Alembic ou similar).** O backend só roda `Base.metadata.create_all()` na inicialização, que cria tabelas que não existem — **não altera tabelas já existentes**. Qualquer mudança de schema (nova coluna, constraint) precisa de um `ALTER TABLE` manual, rodado em cada ambiente (local e produção). Migrations feitas dessa forma ficam documentadas como scripts `.sql` em `backend/` (ex.: `migration_counter_offer.sql`).
- **Datas em UTC:** os timestamps usados em cálculos ao vivo (como a contagem da reserva de 24h) são gerados e serializados em UTC explícito, independente do fuso horário do servidor — importante manter esse padrão em novos campos de data que alimentem contadores no frontend.
- **Autenticação:** o token JWT fica em `sessionStorage` (não em cookie httpOnly) e não há refresh automático — uma sessão expirada só é tratada quando alguma chamada autenticada recebe 401.

## Branches

- `main` — produção, deploy automático (Railway + Vercel)
- `develop` — integração
- branches de feature (ex.: `yuri`, `italo`) — desenvolvimento individual, merge via PR
