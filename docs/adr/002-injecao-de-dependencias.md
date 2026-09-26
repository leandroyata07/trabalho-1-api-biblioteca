# ADR 002 — Injeção de Dependências

## Contexto

Os Services dependem dos Repositories e os Controllers dependem dos Services.

Criar essas dependências diretamente dentro dos componentes aumentaria o acoplamento da aplicação.

## Decisão

Utilizar Dependency Injection e centralizar a composição das dependências no arquivo:

```text
src/config/container.js