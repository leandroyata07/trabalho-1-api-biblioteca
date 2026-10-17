# Trilha 4 — Mapeamento das entregas

## Atividade 1 — Primeiro servidor Socket.IO com salas e eventos

Implementação em `src/server.js` e `src/adapters/websocket/socketIoServer.js`:

- Socket.IO integrado ao mesmo servidor HTTP da API Express.
- Salas `biblioteca:geral`, `emprestimos`, `notificacoes` e `livro:{id}`.
- Emissão/escuta de eventos de conexão, entrada/saída de salas, empréstimos, devoluções, disponibilidade do livro, notificações e atualização do painel.
- Validação no servidor das salas e dos payloads recebidos.
- Eventos de participantes, mensagens de erro e reconexão/sincronização do estado.

## Atividade 2 — Integrar Websockets à aplicação e componentes de interface

A interface React em `frontend/src/App.jsx` consome a API REST e reage aos eventos Socket.IO. Componentes visuais mostram indicadores, notificações e movimentações. A entrega é individual; a documentação não afirma participação de uma equipe real.

## Trabalho 4 — Aplicação em tempo real containerizada

- Opção 3 do enunciado: sistema de acompanhamento com notificações ao vivo no domínio de empréstimos de biblioteca.
- API REST: livros, estudantes, autores, empréstimos e notificações; documentação OpenAPI em `/docs`.
- Persistência: PostgreSQL/Prisma, seis tabelas relacionadas, migrations versionadas, seed idempotente e operações transacionais de empréstimo/devolução.
- Interface: React responsivo servido pelo próprio backend.
- Containerização: Dockerfile multi-stage, usuário `node`, `.dockerignore`, Docker Compose, volume do banco e health checks.
- Qualidade: testes automatizados de eventos Socket.IO, workflow GitHub Actions e encerramento gracioso via SIGTERM/SIGINT.

## Demonstração recomendada

1. Subir do zero com `cp .env.example .env && docker compose up -d --build`.
2. Acessar `http://localhost:3001` em duas abas.
3. Criar um empréstimo em uma aba e conferir a atualização automática na outra.
4. Devolver um livro e observar a disponibilidade, os indicadores e a notificação.
5. Mostrar uma notificação lida persistida e a documentação `/docs`.

> Antes da entrega, execute os comandos de teste, lint e build descritos no README em um ambiente com acesso ao registro npm e Docker. A execução de instalação/testes não foi possível neste ambiente de preparação porque o registro npm não respondeu durante a instalação de dependências.
