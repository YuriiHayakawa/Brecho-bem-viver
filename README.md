# 🛍️ Bazar Interno

> **Marketplace interno para colaboradores comprarem, venderem e trocarem roupas e acessórios usados — conectando reutilização, praticidade e impacto social.**

O **Bazar Interno** é uma plataforma de marketplace desenvolvida para uso interno entre colaboradores, permitindo anunciar, descobrir, reservar, negociar e comprar produtos usados.

Além de facilitar a reutilização de peças, o projeto possui uma proposta social: **parte do valor das vendas é destinada a instituições sociais parceiras.**

---

## ✨ Sobre o projeto

O Bazar Interno transforma o tradicional bazar de colaboradores em uma experiência digital completa.

Cada colaborador pode:

* 📦 Cadastrar produtos para venda
* 📸 Adicionar múltiplas fotos aos anúncios
* 🔎 Pesquisar e filtrar produtos
* ❤️ Reservar produtos por 24 horas
* 💬 Fazer propostas de preço
* 🤝 Negociar através de uma contraproposta
* 💳 Realizar pagamentos via PIX
* 👤 Gerenciar seu próprio perfil
* 📊 Acompanhar seus anúncios e vendas

Administradores possuem recursos adicionais para acompanhar a operação da plataforma e controlar usuários, produtos, vendas e arrecadação para doação.

### 🎯 Objetivo

Criar um ambiente interno **seguro, simples e confiável** para estimular o consumo consciente e a reutilização de produtos, ao mesmo tempo em que gera impacto social através das doações.

---

## 🚀 Funcionalidades

### 👥 Para todos os usuários

| Funcionalidade              | Descrição                                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| 🔐 **Cadastro e Login**     | Autenticação utilizando JWT                                            |
| 🛍️ **Catálogo**            | Visualização dos produtos disponíveis                                  |
| 🔎 **Busca e filtros**      | Filtros por categoria, gênero, tamanho e status                        |
| 📦 **Cadastro de produtos** | Criação de anúncios com preço, descrição e características             |
| 📸 **Múltiplas imagens**    | Uma imagem de capa + galeria de fotos                                  |
| ⚠️ **Aviso de defeitos**    | Possibilidade de informar problemas ou avarias da peça                 |
| ⏱️ **Reserva**              | Reserva automática do produto por 24 horas                             |
| 💬 **Ofertas**              | Comprador pode enviar uma proposta abaixo do preço anunciado           |
| 🤝 **Contraproposta**       | Vendedor pode responder com um valor específico                        |
| 💳 **Pagamento PIX**        | QR Code gerado a partir da chave PIX do vendedor                       |
| 👤 **Perfil**               | Edição dos dados pessoais, unidade e chave PIX                         |
| 📊 **Dashboard pessoal**    | Indicadores de anúncios, vendas, produtos ativos e valores arrecadados |

### 👑 Para administradores

| Funcionalidade                  | Descrição                                              |
| ------------------------------- | ------------------------------------------------------ |
| 📊 **Dashboard administrativo** | Visão geral da operação                                |
| 🛍️ **Gestão de produtos**      | Consulta de todos os produtos cadastrados              |
| 🔎 **Filtros administrativos**  | Busca por produto, status e vendedor                   |
| 💰 **Registro de vendas**       | Registro manual utilizando o código do produto         |
| ❤️ **Doação estimada**          | Cálculo automático de 10% do valor da venda            |
| 🏷️ **Etiqueta de produto**     | Geração de etiqueta com nome, preço e QR Code PIX      |
| 👥 **Gestão de usuários**       | Edição dos dados dos colaboradores                     |
| 🛡️ **Controle de permissões**  | Promoção ou rebaixamento entre usuário e administrador |

---

## 🔄 Fluxo principal

```text
                    ┌─────────────────┐
                    │   Colaborador   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Cadastra produto│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Catálogo    │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
          ┌─────────────┐         ┌──────────────┐
          │ Compra direta│         │    Oferta    │
          └──────┬──────┘         └──────┬───────┘
                 │                       │
                 │                ┌──────┴───────┐
                 │                │              │
                 │                ▼              ▼
                 │           ┌─────────┐   ┌────────────┐
                 │           │ Aceita  │   │Contraprop. │
                 │           └────┬────┘   └──────┬─────┘
                 │                │               │
                 └────────────────┴───────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Produto reservado│
                         │      24h        │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Venda registrada│
                         │ pelo administrador│
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ 10% para doação │
                         └─────────────────┘
```

---

## 🧩 Stack tecnológica

### Backend

[FastAPI](https://fastapi.tiangolo.com/?utm_source=chatgpt.com) · [SQLAlchemy](https://www.sqlalchemy.org/?utm_source=chatgpt.com) · PostgreSQL

* **FastAPI** — construção da API REST
* **SQLAlchemy** — ORM e acesso ao banco
* **PostgreSQL** — banco de dados relacional
* **PyJWT** — autenticação baseada em JWT
* **Passlib / bcrypt** — hashing de senhas
* **Cloudinary** — armazenamento das imagens dos produtos
* **qrcode + Pillow** — geração dos QR Codes PIX

### Frontend

[React](https://react.dev/?utm_source=chatgpt.com) · [Vite](https://vitejs.dev/?utm_source=chatgpt.com) · [React Router](https://reactrouter.com/?utm_source=chatgpt.com)

* **React 18** — construção da interface
* **Vite** — ferramenta de build e desenvolvimento
* **React Router** — gerenciamento das rotas
* **Fetch API** — comunicação com o backend
* **Context API** — gerenciamento do contexto de notificações
* **CSS** — estilização da aplicação

### Infraestrutura

* 🐳 **Docker** — PostgreSQL para desenvolvimento local
* 🚂 **Railway** — deploy do backend
* ▲ **Vercel** — deploy do frontend
* ☁️ **Cloudinary** — armazenamento de imagens

---

## 🏗️ Arquitetura

O projeto segue uma separação entre as principais responsabilidades da aplicação.

```text
Bazar-Sebrae/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── deps/
│   │   │
│   │   ├── core/
│   │   │   ├── config
│   │   │   └── security
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── scripts/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── migration_*.sql
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── contexts/
│       └── constants/
│
├── docker-compose.yml
└── railway.toml
```

### Responsabilidades

**Routes**

Responsáveis pelos endpoints HTTP e entrada das requisições.

**Dependencies**

Contém dependências relacionadas à autenticação e autorização, como:

* `get_current_user`
* `require_admin`

**Models**

Representam as tabelas e relacionamentos do banco de dados através do SQLAlchemy.

**Schemas**

Responsáveis pela validação e estrutura dos dados de entrada e saída da API utilizando Pydantic.

**Services**

Concentram as regras de negócio da aplicação.

**Frontend Services**

Todas as chamadas HTTP são centralizadas em:

```text
frontend/src/services/api.js
```

---

## 🗄️ Modelo de dados

Principais entidades da aplicação:

### `users`

Armazena os colaboradores cadastrados.

Principais informações:

* Dados pessoais
* Unidade
* Chave PIX
* Papel (`admin` / `user`)

> O valor `vendedor` ainda existe no banco por compatibilidade, mas não é mais utilizado pelo frontend.

### `products`

Representa os anúncios publicados.

Principais informações:

* Preço
* Categoria
* Tamanho
* Status
* Proprietário
* Dados de reserva

Status possíveis:

```text
disponivel
reservada
vendida
```

### `product_images`

Armazena as imagens dos produtos.

Possui suporte para:

* Imagem de capa
* Galeria
* Ordenação das imagens

### `product_offers`

Representa as negociações entre compradores e vendedores.

Status possíveis:

```text
pending
countered
accepted
rejected
cancelled
```

Quando existe uma contraproposta, são armazenados:

* `counter_price`
* `counter_message`

### `sales`

Registra as vendas realizadas.

A partir do valor da venda, o sistema calcula automaticamente a:

```text
Doação sugerida = 10% do valor da venda
```

---

## 🔄 Regras de negócio

### ⏱️ Reserva de 24 horas

Produtos podem ser reservados durante **24 horas**.

A aplicação não utiliza um job ou cron dedicado para liberar reservas.

Em vez disso, utiliza uma estratégia de **expiração preguiçosa**:

```text
Usuário acessa uma rota
        ↓
Sistema verifica reservas expiradas
        ↓
Reserva vencida?
   ↙            ↘
 SIM             NÃO
  ↓               ↓
Libera produto   Mantém reserva
```

A função:

```text
release_expired_reservations
```

é executada no início da maioria das rotas relacionadas a produtos e ofertas.

---

### 💬 Ofertas e contrapropostas

O comprador pode enviar uma oferta abaixo do preço anunciado.

O vendedor pode:

* ✅ Aceitar
* ❌ Recusar
* 🤝 Enviar uma contraproposta

A contraproposta encerra a negociação em **uma única rodada adicional**.

Depois que o vendedor envia a contraproposta:

```text
Comprador
   │
   ├── Aceitar → negociação concluída
   │
   └── Recusar → negociação encerrada
```

Não são permitidas novas rodadas de negociação.

---

### 💰 Registro de venda

As vendas são registradas manualmente por um administrador.

O administrador informa o código do produto:

```text
BZR-XXXX
```

O sistema então:

1. Localiza o produto
2. Identifica o valor da venda
3. Calcula a doação sugerida
4. Registra a venda
5. Atualiza o status do produto

Quando a venda é originada de uma oferta ou contraproposta aceita, o valor negociado é utilizado como valor da venda.

---

## 💳 Pagamento via PIX

O sistema utiliza a **chave PIX cadastrada pelo vendedor** para gerar o QR Code de pagamento.

O QR Code pode ser utilizado diretamente no fluxo de compra ou na geração da etiqueta do produto.

A geração é realizada através de:

```text
qrcode
Pillow
```

---

## 🖼️ Upload de imagens

Em produção, as imagens dos produtos são armazenadas no:

[Cloudinary](https://cloudinary.com/?utm_source=chatgpt.com)

Durante o desenvolvimento local, o backend pode utilizar:

```text
backend/uploads/
```

Esse diretório é ignorado pelo Git e não deve ser utilizado como armazenamento permanente em produção.

---

## ⚙️ Como rodar localmente

### Pré-requisitos

Certifique-se de possuir:

* Python **3.10+**
* Node.js **LTS**
* npm
* PostgreSQL

Ou utilize Docker para executar o PostgreSQL localmente.

---

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd Bazar-Sebrae
```

---

### 2. Suba o PostgreSQL

Utilizando Docker:

```bash
docker compose up -d
```

O ambiente disponibiliza:

```text
Host: localhost
Port: 5432
Database: bazar_sebrae
User: postgres
Password: postgres
```

Caso utilize uma instalação local do PostgreSQL, configure a variável `DATABASE_URL` de acordo com seu ambiente.

---

### 3. Configure o backend

Entre na pasta:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

#### Windows / PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

> No Windows, você também pode simplesmente copiar `.env.example` e renomeá-lo para `.env`.

Preencha as variáveis necessárias e execute:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend disponível em:

```text
http://localhost:8000
```

Documentação Swagger:

```text
http://localhost:8000/docs
```

---

### 4. Popule dados de teste

Opcionalmente:

```bash
python -m app.scripts.seed_users
python -m app.scripts.seed_products
```

---

### 5. Execute o frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

Frontend disponível em:

```text
http://localhost:5173
```

Por padrão, o frontend utiliza:

```text
http://localhost:8000
```

como endereço da API.

Para utilizar outro endereço, crie:

```text
frontend/.env
```

com:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🔐 Variáveis de ambiente

As variáveis do backend ficam em:

```text
backend/.env
```

| Variável                | Obrigatória | Descrição                                |
| ----------------------- | :---------: | ---------------------------------------- |
| `DATABASE_URL`          |      ✅      | String de conexão com PostgreSQL         |
| `SECRET_KEY`            |      ✅      | Chave utilizada para assinatura dos JWTs |
| `CLOUDINARY_CLOUD_NAME` |      ✅      | Cloud Name do Cloudinary                 |
| `CLOUDINARY_API_KEY`    |      ✅      | API Key do Cloudinary                    |
| `CLOUDINARY_API_SECRET` |      ✅      | API Secret do Cloudinary                 |
| `ALLOWED_ORIGINS`       |      ✅      | Origens permitidas pelo CORS             |
| `APP_NAME`              |      ❌      | Nome da aplicação                        |
| `APP_ENV`               |      ❌      | Ambiente da aplicação                    |
| `APP_PORT`              |      ❌      | Porta da aplicação                       |

> ⚠️ **Nunca versione o arquivo `.env` ou credenciais reais no Git.**

---

## 🗃️ Banco de dados e migrations

O projeto atualmente **não utiliza Alembic ou outra ferramenta de migration**.

Na inicialização, o backend executa:

```python
Base.metadata.create_all()
```

Isso significa que:

* tabelas inexistentes são criadas;
* tabelas existentes **não são alteradas automaticamente**;
* novas colunas ou constraints precisam ser adicionadas manualmente.

Por isso, alterações no schema devem ser documentadas através de scripts SQL:

```text
backend/migration_*.sql
```

Exemplo:

```text
backend/migration_counter_offer.sql
```

Esses scripts devem ser executados nos ambientes necessários:

```text
Local
  ↓
Desenvolvimento
  ↓
Produção
```

---

## 🕐 Datas e horários

Os timestamps utilizados em cálculos em tempo real devem seguir o padrão:

```text
UTC
```

Isso é especialmente importante para funcionalidades como:

* expiração de reservas;
* contadores regressivos;
* timestamps de ofertas;
* timestamps de vendas.

Novos campos de data que alimentem cálculos no frontend devem manter esse mesmo padrão.

---

## 🔐 Autenticação

A autenticação utiliza:

```text
JWT
```

O token é armazenado no:

```text
sessionStorage
```

Atualmente:

* não existe refresh token automático;
* a sessão expirada é identificada quando uma requisição autenticada retorna `401`;
* o usuário precisa realizar login novamente após a expiração da sessão.

---

## ☁️ Deploy

### Backend

O backend é hospedado no:

[Railway](https://railway.app/?utm_source=chatgpt.com)

Configuração:

```text
Plataforma: Railway
Diretório: backend/
Branch: main
Configuração: railway.toml + Procfile
```

### Frontend

O frontend é hospedado na:

[Vercel](https://vercel.com/?utm_source=chatgpt.com)

Configuração:

```text
Plataforma: Vercel
Diretório: frontend/
Branch: main
```

### Imagens

```text
Produção → Cloudinary
Desenvolvimento → backend/uploads/
```

---

## 🌿 Estratégia de branches

O projeto utiliza três níveis principais de branches:

```text
main
 │
 └── Produção
      │
      └── develop
           │
           ├── yuri
           ├── italo
           └── feature/*
```

### `main`

Branch de produção.

Possui deploy automático para:

* Railway
* Vercel

### `develop`

Branch utilizada para integração das funcionalidades antes de chegarem à produção.

### Branches individuais

Branches destinadas ao desenvolvimento de cada integrante ou funcionalidade.

Exemplos:

```text
yuri
italo
feature/catalogo
feature/offers
feature/admin-dashboard
```

O fluxo recomendado é:

```text
feature/*
    ↓
develop
    ↓
Pull Request
    ↓
main
    ↓
Deploy
```

---

## 📁 Principais diretórios

### Backend

```text
backend/app/
├── api/
│   ├── routes/
│   └── deps/
├── core/
├── models/
├── schemas/
├── services/
├── scripts/
└── main.py
```

### Frontend

```text
frontend/src/
├── pages/
├── components/
├── services/
│   └── api.js
├── contexts/
└── constants/
```

---

## 📌 Notas técnicas

### Banco de dados

O projeto utiliza PostgreSQL e SQLAlchemy.

O schema é criado através do:

```python
Base.metadata.create_all()
```

Alterações posteriores precisam ser realizadas através dos scripts SQL de migration.

### Imagens

O armazenamento permanente de imagens em produção é realizado através do Cloudinary.

### Reservas

Não existe cron/job para expiração.

A aplicação utiliza expiração lazy através da função:

```text
release_expired_reservations
```

### Negociação

A negociação permite apenas **uma contraproposta**.

### Doação

A doação sugerida corresponde a:

```text
10% × valor da venda
```

### PIX

O QR Code é gerado utilizando a chave PIX cadastrada pelo vendedor.

---

## 🧪 Status do projeto

> 🚧 **Em desenvolvimento**

O projeto possui backend e frontend estruturados, com os principais fluxos de marketplace, negociação, reservas, vendas, administração e integração com PIX implementados.

---

## 🤝 Contribuição

Para contribuir:

1. Crie uma branch a partir de `develop`
2. Desenvolva sua funcionalidade
3. Faça commits pequenos e descritivos
4. Abra um Pull Request para `develop`
5. Após validação, a funcionalidade poderá ser promovida para `main`

Exemplo:

```bash
git checkout develop
git pull origin develop

git checkout -b feature/minha-feature

git add .
git commit -m "feat: adiciona minha feature"

git push origin feature/minha-feature
```

---

## 📄 Licença

Este projeto foi desenvolvido para fins internos e acadêmicos.

---

<div align="center">

### 🛍️ Bazar Interno

**Reutilizar. Conectar. Transformar. 💚**

</div>
