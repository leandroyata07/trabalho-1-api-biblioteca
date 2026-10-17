import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { io as createClient } from "socket.io-client";
import { setupSocketServer } from "../src/adapters/websocket/socketIoServer.js";
import { eventBus } from "../src/application/eventBus.js";

async function setup() {
  const http = createServer();
  const server = new Server(http, { connectionStateRecovery: { maxDisconnectionDuration: 1000 } });
  const fakePrisma = {
    livro: { count: async () => 4 },
    emprestimo: { count: async ({ where }) => where.devolvido ? 1 : 2 },
  };
  const fakeNotifications = {
    contarNaoLidas: async () => 3,
    listar: async () => ({ dados: [], total: 0 }),
    marcarComoLida: async (id) => ({ id, lida: true }),
  };
  const remove = setupSocketServer(server, { prisma: fakePrisma, notificacaoService: fakeNotifications, eventBus });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  const client = createClient(`http://127.0.0.1:${port}`, { reconnection: false, timeout: 2000 });
  await new Promise((resolve, reject) => { client.once("connect", resolve); client.once("connect_error", reject); });
  return { http, server, client, remove };
}
async function cleanup(ctx) {
  ctx.client.disconnect();
  ctx.remove();
  await new Promise((resolve) => ctx.server.close(() => resolve()));
}

test("Socket.IO conecta o cliente e insere na sala geral", async () => {
  const ctx = await setup();
  try {
    assert.equal(ctx.client.connected, true);
    const confirmation = await ctx.client.timeout(1000).emitWithAck("sala:entrar", { sala: "notificacoes" });
    assert.equal(confirmation.ok, true);
    assert.equal(confirmation.sala, "notificacoes");
    assert.equal(typeof confirmation.participantes, "number");
  } finally { await cleanup(ctx); }
});

test("Socket.IO rejeita sala inválida", async () => {
  const ctx = await setup();
  try {
    const confirmation = await ctx.client.timeout(1000).emitWithAck("sala:entrar", { sala: "admin-geral" });
    assert.equal(confirmation.ok, false);
    assert.match(confirmation.erro, /Sala inválida/);
  } finally { await cleanup(ctx); }
});

test("Socket.IO rejeita ID de notificação inválido", async () => {
  const ctx = await setup();
  try {
    const confirmation = await ctx.client.timeout(1000).emitWithAck("notificacao:marcar-lida", { id: -4 });
    assert.equal(confirmation.ok, false);
    assert.match(confirmation.erro, /ID de notificação/);
  } finally { await cleanup(ctx); }
});

test("Socket.IO fornece snapshot do painel a um cliente que reconecta", async () => {
  const ctx = await setup();
  try {
    const confirmation = await ctx.client.timeout(1000).emitWithAck("painel:solicitar", {});
    assert.equal(confirmation.ok, true);
    assert.equal(confirmation.dados.livros, 4);
    assert.equal(confirmation.dados.emprestimosAtivos, 2);
    assert.equal(confirmation.dados.notificacoesNaoLidas, 3);
  } finally { await cleanup(ctx); }
});
