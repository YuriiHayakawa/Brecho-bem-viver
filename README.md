# 🛍️ Brechó Bem Viver

> **Marketplace interno para pessoas colaboradoras comprarem, venderem e trocarem roupas e acessórios usados — conectando reutilização, praticidade e impacto social.**

O **Brechó Bem Viver** é uma plataforma de marketplace desenvolvida para uso interno entre pessoas colaboradoras, permitindo anunciar, descobrir, negociar e comprar produtos usados.

Além de facilitar a reutilização de peças, o projeto possui uma proposta social: **parte do valor das vendas é destinada a instituições sociais parceiras.**

---

## ✨ Sobre o projeto

O Brechó Bem Viver transforma o tradicional bazar de colaboradores em uma experiência digital completa.

Cada colaborador pode:

* 📦 Cadastrar produtos para venda
* 📸 Adicionar múltiplas fotos aos anúncios
* 🔎 Pesquisar e filtrar produtos
* ❤️ Reservar produtos por 24 horas *(desativado na 1ª edição — ver [Funcionalidades configuráveis](#-funcionalidades-configuráveis))*
* 💬 Fazer propostas de preço
* 🤝 Negociar através de uma contraproposta
* 💳 Realizar pagamentos via PIX
* 👤 Gerenciar seu próprio perfil e alterar a própria senha
* 📊 Acompanhar seus anúncios e vendas

Administradores possuem recursos adicionais para acompanhar a operação da plataforma e controlar usuários, produtos, vendas e arrecadação para doação.

### 🎯 Objetivo

Criar um ambiente interno **seguro, simples e confiável** para estimular o consumo consciente e a reutilização de produtos, ao mesmo tempo em que gera impacto social através das doações.

---

## 🚀 Funcionalidades

### 👥 Para todos os usuários

| Funcionalidade              | Descrição                                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| 🔐 **Cadastro e Login**     | Autenticação utilizando JWT (e-mail sem diferenciar maiúsculas)        |
| 🛍️ **Catálogo**            | Visualização dos produtos disponíveis (exige login)                    |
| 🔎 **Busca e filtros**      | Busca por nome ou marca; filtros por categoria, gênero e status        |
| 📦 **Cadastro de produtos** | Criação de anúncios com preço, descrição e características             |
| 📸 **Múltiplas imagens**    | Uma imagem de capa + galeria; fotos reduzidas no navegador antes do envio |
| ⚠️ **Aviso de defeitos**    | Possibilidade de informar problemas ou avarias da peça                 |
| 🗑️ **Remover anúncio**      | O dono remove o anúncio (bloqueado se reservado ou vendido)            |
| ⏱️ **Reserva**              | Reserva do produto por 24 horas, com cancelamento pelo comprador — *desativada na 1ª edição* |
| 💬 **Ofertas**              | Comprador pode enviar uma proposta abaixo do preço anunciado           |
| 🤝 **Contraproposta**       | Vendedor pode responder com um valor específico                        |
| 💳 **Pagamento PIX**        | QR Code gerado a partir da chave PIX do vendedor                       |
| 👤 **Perfil**               | Edição dos dados pessoais, unidade e chave PIX                         |
| 🔑 **Alterar senha**        | Troca da própria senha no Perfil (senha atual + nova)                  |
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
| 👥 **Gestão de usuários**       | Edição dos dados das pessoas colaboradoras             |
| 🔑 **Reset de senha**           | Gera uma senha temporária (mostrada uma única vez)     |
| 🗑️ **Remover anúncios**         | Remove anúncios de qualquer pessoa (mesmas regras do dono) |
| 🛡️ **Controle de permissões**  | Promoção ou rebaixamento entre usuário e administrador |

---

## 🔄 Fluxo principal

```text
                     ┌───────────────────────┐
                     │  Pessoa colaboradora  │
                     └───────────┬───────────┘
                                 ▼
                     ┌───────────────────────┐
                     │   Cadastra produto    │
                     └───────────┬───────────┘
                                 ▼
                     ┌───────────────────────┐
                     │       Catálogo        │
                     └───────────┬───────────┘
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │     Compra direta     │       │        Oferta         │
     │  (QR PIX da etiqueta) │       └───────────┬───────────┘
     └───────────┬───────────┘           ┌───────┴───────┐
                 │                       ▼               ▼
                 │                  ┌─────────┐  ┌────────────────┐
                 │                  │ Aceita  │  │ Contraproposta │
                 │                  └────┬────┘  │     aceita     │
                 │                       │       └───────┬────────┘
                 │                       └───────┬───────┘
                 │                               ▼
                 │                   ┌───────────────────────┐
                 │                   │   Produto reservado   │
                 │                   │  24h para o comprador │
                 │                   └───────────┬───────────┘
                 └───────────────┬───────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │   Venda registrada    │
                     │  por um administrador │
                     └───────────┬───────────┘
                                 ▼
                     ┌───────────────────────┐
                     │  Doação sugerida: 10% │
                     └───────────────────────┘
```

> Na 1ª edição o bazar é **presencial**: as peças ficam expostas com a etiqueta, a pessoa paga pelo QR Code PIX e um administrador registra a venda. O botão **Reservar** (compra direta com reserva de 24h) está desativado — ver [Funcionalidades configuráveis](#-funcionalidades-configuráveis).

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
Brecho-Bem-Viver/
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

Produtos podem ser reservados durante **24 horas** — pelo botão **Reservar** (reserva direta) ou automaticamente quando o vendedor **aceita uma proposta**.

> Na 1ª edição, a reserva direta está **desativada na interface** (ver [Funcionalidades configuráveis](#-funcionalidades-configuráveis)); a reserva por proposta aceita continua funcionando.

* O comprador pode **cancelar a própria reserva direta**; a reserva originada de proposta aceita **não pode ser cancelada** por ele.
* Ações simultâneas sobre o mesmo produto (reservar, aceitar proposta, registrar venda…) **travam a linha no banco** (`SELECT ... FOR UPDATE`), evitando que duas pessoas recebam "reservado com sucesso" para a mesma peça.

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

Quando a venda é originada de uma oferta ou contraproposta aceita **de quem está com a reserva atual**, o valor negociado é sugerido como valor da venda (negociações antigas, de reservas que já expiraram, são ignoradas).

Ao registrar a venda, as propostas da peça que ainda estavam em aberto (`pending` / `countered`) passam a `cancelled`.

---

### 🗑️ Remoção de anúncio

O dono do anúncio ou um administrador pode removê-lo (o produto fica inativo — o histórico é mantido).

* **Não é permitido** remover peça **vendida** ou **reservada** (o comprador pode já ter pago via PIX).
* As propostas em aberto da peça passam a `cancelled`.
* O anúncio removido some do catálogo e dos totais dos dashboards e não pode mais ser reservado.

---

### 🔑 Senhas

Não há "esqueci minha senha" por e-mail. Em vez disso:

* **Admin** — em **Gestão de Usuários**, o botão **Senha** gera uma **senha temporária aleatória** (10 caracteres, sem caracteres ambíguos) para outra pessoa. Ela é mostrada **uma única vez**; no banco fica apenas o hash.
* **Todo usuário** — em **Perfil → Alterar senha**, troca a própria senha (exige a senha atual; nova senha com no mínimo 6 caracteres).

Endpoints: `POST /users/{id}/reset-password` (admin) e `PUT /users/me/password`.

> Sessões já abertas continuam válidas até expirarem (60 min) depois de um reset.

---

## 🧰 Funcionalidades configuráveis

Algumas funcionalidades da interface podem ser ligadas/desligadas sem apagar código, em:

```text
frontend/src/constants/features.js
```

| Chave             | Valor atual | O que controla |
| ----------------- | :---------: | -------------- |
| `RESERVAS_ATIVAS` | `false`     | Botão **Reservar**, tela/menu **Minhas Reservas**, botão **Cancelar reserva** e o cartão de reserva em **Orientações**. Com `false`, o link `/minhas-reservas` redireciona para o catálogo. |

O backend da reserva continua completo (endpoints, expiração, cancelamento). Para reativá-la — prevista para a 2ª edição do bazar — basta trocar para `true` e publicar o frontend.

> Mesmo com `RESERVAS_ATIVAS = false`, **proposta aceita continua reservando a peça** por 24h para o comprador.

---

## 💳 Pagamento via PIX

O sistema utiliza a **chave PIX cadastrada pelo vendedor** para gerar o QR Code de pagamento.

O QR Code pode ser utilizado diretamente no fluxo de compra ou na geração da etiqueta do produto.

A chave é validada no cadastro e na edição do perfil: CPF (com dígitos verificadores), telefone com DDD (aceita `+55`), e-mail ou chave aleatória no formato do Banco Central.

A geração é realizada através de:

```text
qrcode
Pillow
```

---

## 🖼️ Upload de imagens

As imagens dos produtos são armazenadas no [Cloudinary](https://cloudinary.com/?utm_source=chatgpt.com) **em todos os ambientes** — inclusive no desenvolvimento local, que também precisa das credenciais do Cloudinary no `.env`.

* **Antes do envio**, o navegador reduz a foto (lado maior até 1600px, JPEG). Se uma foto falhar, o produto já criado não é duplicado.
* **Na exibição**, as imagens são pedidas já redimensionadas ao Cloudinary (`f_auto,q_auto,w_…`), via `frontend/src/utils/image.js`.

> A pasta `backend/uploads/` é legado e não é usada pelo upload atual.

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
cd Brecho-Bem-Viver
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

> ⚠️ **Windows:** se você também tiver o PostgreSQL instalado como serviço (ex.: `postgresql-x64-18`), ele e o container do Docker disputam a porta `5432` — só um sobe. Use apenas um dos dois (o projeto usa o container `bazar_sebrae_db`, que sobe sozinho com o Docker Desktop).

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

Rotas **públicas** (sem login): `POST /auth/login`, `POST /users/` (criar conta) e `/health`. **Todas as demais exigem token** — inclusive listar e ver produtos, porque a resposta traz a chave PIX dos vendedores.

O e-mail é salvo em minúsculas e o login **não diferencia maiúsculas/minúsculas**.

> Erros de regra de negócio usam `400`, nunca `401` — o frontend trata todo `401` como sessão expirada e desloga a pessoa (por exemplo, "senha atual incorreta" responde `400`).

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
Produção e desenvolvimento → Cloudinary
```

### Ordem de publicação

Um merge na `main` publica backend (Railway) e frontend (Vercel) ao mesmo tempo. Quando uma mudança altera o contrato da API (ex.: rota que passa a exigir login), o site pode falhar por alguns minutos até os dois terminarem — prefira publicar **fora do horário de uso** e peça um **F5** a quem já estava com o site aberto.

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

O armazenamento de imagens é realizado através do Cloudinary (upload reduzido no navegador; exibição redimensionada pelo Cloudinary).

### Listas fixas do frontend

Categorias (ordem alfabética, "Outros" no fim), gêneros e tamanhos ficam em `frontend/src/constants/products.js`; as unidades, em `frontend/src/constants/units.js`.

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

### 🛍️ Brechó Bem Viver

**Reutilizar. Conectar. Transformar. 💚**

</div>
