const ROOMS = new Set(["biblioteca", "emprestimos", "notificacoes"]);
const CLIENT_EVENTS = new Set(["sala:entrar", "sala:sair", "painel:solicitar", "notificacoes:sincronizar", "notificacao:marcar-lida"]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function validPositiveInteger(value) { return Number.isSafeInteger(value) && value > 0; }
function acknowledge(ack, data) { if (typeof ack === "function") ack(data); }
function fail(socket, ack, message) {
  const error = { ok: false, erro: message };
  socket.emit("socket:erro", error);
  acknowledge(ack, error);
}
function parseRoom(payload) {
  if (!isPlainObject(payload) || typeof payload.sala !== "string") return null;
  if (ROOMS.has(payload.sala)) return payload.sala === "biblioteca" ? "biblioteca:geral" : payload.sala;
  if (payload.sala === "livro" && validPositiveInteger(payload.livroId)) return `livro:${payload.livroId}`;
  return null;
}

export function setupSocketServer(io, { prisma, notificacaoService, eventBus }) {
  // Forward application events to rooms; service/domain code does not depend on Socket.IO.
  const subscriptions = [
    eventBus.subscribe("emprestimo:criado", (data) => {
      io.to("biblioteca:geral").emit("emprestimo:criado", data);
      io.to("emprestimos").emit("emprestimo:criado", data);
      io.to(`livro:${data.livroId}`).emit("emprestimo:criado", data);
    }),
    eventBus.subscribe("emprestimo:devolvido", (data) => {
      io.to("biblioteca:geral").emit("emprestimo:devolvido", data);
      io.to("emprestimos").emit("emprestimo:devolvido", data);
      io.to(`livro:${data.livroId}`).emit("emprestimo:devolvido", data);
    }),
    eventBus.subscribe("emprestimo:atualizado", (data) => io.to("emprestimos").emit("emprestimo:atualizado", data)),
    eventBus.subscribe("emprestimo:excluido", (data) => io.to("emprestimos").emit("emprestimo:excluido", data)),
    eventBus.subscribe("livro:disponibilidade", (data) => {
      io.to("biblioteca:geral").emit("livro:disponibilidade", data);
      io.to(`livro:${data.livroId}`).emit("livro:disponibilidade", data);
    }),
    eventBus.subscribe("notificacao:nova", (data) => {
      io.to("biblioteca:geral").emit("notificacao:nova", data);
      io.to("notificacoes").emit("notificacao:nova", data);
    }),
    eventBus.subscribe("notificacao:lida", (data) => {
      io.to("biblioteca:geral").emit("notificacao:lida", data);
      io.to("notificacoes").emit("notificacao:lida", data);
    }),
    eventBus.subscribe("notificacao:lidas-todas", (data) => io.to("notificacoes").emit("notificacao:lidas-todas", data)),
    eventBus.subscribe("painel:atualizar", async () => {
      try {
        const [livros, livrosDisponiveis, emprestimosAtivos, emprestimosDevolvidos, notificacoesNaoLidas] = await Promise.all([
          prisma.livro.count(), prisma.livro.count({ where: { disponivel: true } }),
          prisma.emprestimo.count({ where: { devolvido: false } }), prisma.emprestimo.count({ where: { devolvido: true } }),
          notificacaoService.contarNaoLidas(),
        ]);
        io.to("biblioteca:geral").emit("painel:atualizado", { livros, livrosDisponiveis, emprestimosAtivos, emprestimosDevolvidos, notificacoesNaoLidas });
      } catch (error) {
        console.error("Falha ao atualizar painel em tempo real:", error?.message || error);
      }
    }),
  ];

  io.on("connection", (socket) => {
    socket.join("biblioteca:geral");
    socket.emit("conexao:estado", { conectado: true, socketId: socket.id, reconectado: socket.recovered === true });
    io.to("biblioteca:geral").emit("participantes:atualizados", { sala: "biblioteca:geral", total: io.sockets.adapter.rooms.get("biblioteca:geral")?.size ?? 0 });

    socket.onAny((eventName) => {
      if (typeof eventName !== "string" || !CLIENT_EVENTS.has(eventName)) {
        socket.emit("socket:erro", { ok: false, erro: "Evento não permitido" });
      }
    });

    socket.on("sala:entrar", (payload, ack) => {
      const room = parseRoom(payload);
      if (!room) return fail(socket, ack, "Sala inválida. Use biblioteca, emprestimos, notificacoes ou livro com livroId válido.");
      socket.join(room);
      const resposta = { ok: true, sala: room, participantes: io.sockets.adapter.rooms.get(room)?.size ?? 0 };
      socket.emit("sala:entrou", resposta);
      io.to(room).emit("participantes:atualizados", { sala: room, total: resposta.participantes });
      return acknowledge(ack, resposta);
    });

    socket.on("sala:sair", (payload, ack) => {
      const room = parseRoom(payload);
      if (!room || room === "biblioteca:geral") return fail(socket, ack, "Sala inválida ou obrigatória.");
      socket.leave(room);
      const total = io.sockets.adapter.rooms.get(room)?.size ?? 0;
      io.to(room).emit("participantes:atualizados", { sala: room, total });
      const resposta = { ok: true, sala: room, participantes: total };
      socket.emit("sala:saiu", resposta);
      return acknowledge(ack, resposta);
    });

    socket.on("painel:solicitar", async (payload, ack) => {
      if (payload !== undefined && !isPlainObject(payload)) return fail(socket, ack, "Payload do painel deve ser um objeto.");
      try {
        const [livros, livrosDisponiveis, emprestimosAtivos, emprestimosDevolvidos, notificacoesNaoLidas] = await Promise.all([
          prisma.livro.count(), prisma.livro.count({ where: { disponivel: true } }),
          prisma.emprestimo.count({ where: { devolvido: false } }), prisma.emprestimo.count({ where: { devolvido: true } }),
          notificacaoService.contarNaoLidas(),
        ]);
        const dados = { livros, livrosDisponiveis, emprestimosAtivos, emprestimosDevolvidos, notificacoesNaoLidas };
        socket.emit("painel:atualizado", dados);
        acknowledge(ack, { ok: true, dados });
      } catch {
        return fail(socket, ack, "Não foi possível sincronizar o painel.");
      }
    });

    socket.on("notificacoes:sincronizar", async (payload, ack) => {
      const limite = payload === undefined ? 20 : payload?.limite;
      if ((payload !== undefined && !isPlainObject(payload)) || !Number.isInteger(limite) || limite < 1 || limite > 50) {
        return fail(socket, ack, "Informe um objeto com limite inteiro entre 1 e 50.");
      }
      try {
        const resultado = await notificacaoService.listar({ skip: 0, take: limite, where: {} });
        const dados = { notificacoes: resultado.dados, total: resultado.total, naoLidas: await notificacaoService.contarNaoLidas() };
        socket.emit("notificacoes:sincronizadas", dados);
        acknowledge(ack, { ok: true, dados });
      } catch {
        return fail(socket, ack, "Não foi possível sincronizar as notificações.");
      }
    });

    socket.on("notificacao:marcar-lida", async (payload, ack) => {
      if (!isPlainObject(payload) || !validPositiveInteger(payload.id)) return fail(socket, ack, "Informe um ID de notificação inteiro e positivo.");
      try {
        const dados = await notificacaoService.marcarComoLida(payload.id);
        acknowledge(ack, { ok: true, dados });
      } catch (error) {
        return fail(socket, ack, error?.status === 404 ? "Notificação não encontrada." : "Não foi possível atualizar a notificação.");
      }
    });

    socket.on("disconnect", (reason) => {
      const total = io.sockets.adapter.rooms.get("biblioteca:geral")?.size ?? 0;
      io.to("biblioteca:geral").emit("participantes:atualizados", { sala: "biblioteca:geral", total, motivo: reason });
    });
  });

  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}
