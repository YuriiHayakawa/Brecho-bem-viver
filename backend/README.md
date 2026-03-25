# Backend - Bazar Sebrae

Este diretório contém o backend da aplicação, construído com **Python** e **FastAPI**.

## Pré-requisitos

- Python 3.10+ (recomendado)

Verifique a versão instalada:

```bash
python3 --version
```

## Criar ambiente virtual

Dentro da pasta `backend`:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # macOS / Linux
# No Windows (PowerShell):
# .venv\\Scripts\\Activate.ps1
```

## Instalar dependências

Com o ambiente virtual ativado e ainda dentro de `backend`:

```bash
pip install -r requirements.txt
```

As principais dependências são:

- `fastapi` — framework web para o backend.
- `uvicorn[standard]` — servidor ASGI para rodar a API.
- `pydantic-settings` — para carregar configurações via variáveis de ambiente / arquivo `.env`.

## Variáveis de ambiente

Um arquivo de exemplo foi criado em `.env.example`.

1. Copie o arquivo para `.env`:

```bash
cp .env.example .env
```

2. Ajuste os valores conforme o ambiente (nome da aplicação, host/porta do banco etc.).

> Observação: a conexão real com o PostgreSQL **ainda não está implementada**. Apenas preparamos as variáveis necessárias.

## Executar o servidor de desenvolvimento

Com o ambiente virtual ativado, dentro da pasta `backend`:

```bash
uvicorn app.main:app --reload --port 8000
```

- A API estará disponível em: `http://localhost:8000`
- Documentação automática (Swagger UI): `http://localhost:8000/docs`
- Documentação alternativa (ReDoc): `http://localhost:8000/redoc`

## Endpoints iniciais

- `GET /` — Retorna uma mensagem simples indicando que a API está em execução e o ambiente atual.
- `GET /health` — Endpoint de health check retornando `{ "status": "ok" }`.

Esta estrutura foi pensada para ser fácil de expandir, permitindo adicionar novos módulos, rotas e camadas (serviços, repositórios, etc.) conforme o projeto crescer.
