# Arquitetura da API de Biblioteca

## 1. Visão geral

A API de Biblioteca foi refatorada a partir da implementação desenvolvida no Trabalho 2, mantendo o comportamento externo da API e reorganizando o código em camadas com responsabilidades bem definidas.

A arquitetura adotada utiliza:

- Routes;
- Controllers;
- Services;
- Repositories;
- Middlewares;
- Configuração de dependências;
- Persistência com Prisma ORM e SQLite.

O objetivo da refatoração é separar responsabilidades, facilitar a manutenção, reduzir o acoplamento entre as partes do sistema e permitir que as regras de negócio sejam mantidas fora dos Controllers e da camada de persistência.

---

## 2. Arquitetura em camadas

```text
                    ┌──────────────────────┐
                    │       Cliente        │
                    │ Postman / navegador  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │        Routes        │
                    │ Definição das rotas  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Controllers      │
                    │ HTTP ↔ aplicação     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Services       │
                    │ Regras e casos de uso│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Repositories     │
                    │ Acesso aos dados     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Prisma / SQLite    │
                    │     Persistência     │
                    └──────────────────────┘