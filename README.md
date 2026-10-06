# 🛍️ Brechó Bem Viver

> **Marketplace interno para colaboradores comprarem, venderem e trocarem roupas e acessórios usados — conectando reutilização, praticidade e impacto social.**

O **Brechó Bem Viver** é uma plataforma de marketplace desenvolvida para uso interno entre colaboradores, permitindo anunciar, descobrir, reservar, negociar e comprar produtos usados.

Além de facilitar a reutilização de peças, o projeto possui uma proposta social: **parte do valor das vendas é destinada a instituições sociais parceiras.**

---

## ✨ Sobre o projeto

O Brechó Bem Viver transforma o tradicional bazar de colaboradores em uma experiência digital completa.

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
```
