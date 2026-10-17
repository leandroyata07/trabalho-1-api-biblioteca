import { parseId } from "../utils/normalizers.js";
import { buildPage, getPagination } from "../utils/pagination.js";

export function criarNotificacaoController(notificacaoService) {
  return {
    async listar(req, res, next) {
      try {
        const { pagina, limite, skip, take } = getPagination(req);
        const where = {};
        if (req.query.lida !== undefined) {
          if (!['true', 'false'].includes(String(req.query.lida).toLowerCase())) return res.status(400).json({ erro: "O filtro lida deve ser true ou false" });
          where.lida = String(req.query.lida).toLowerCase() === "true";
        }
        if (req.query.tipo) {
          const tipo = String(req.query.tipo).trim().slice(0, 60);
          if (!tipo) return res.status(400).json({ erro: "O filtro tipo é inválido" });
          where.tipo = tipo;
        }
        const { dados, total } = await notificacaoService.listar({ skip, take, where });
        return res.json(buildPage(dados, total, pagina, limite));
      } catch (error) { next(error); }
    },
    async naoLidas(req, res, next) {
      try { return res.json({ total: await notificacaoService.contarNaoLidas() }); }
      catch (error) { next(error); }
    },
    async marcarComoLida(req, res, next) {
      try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ erro: "ID de notificação inválido" });
        return res.json(await notificacaoService.marcarComoLida(id));
      } catch (error) { next(error); }
    },
    async marcarTodasComoLidas(req, res, next) {
      try { return res.json({ mensagem: "Notificações marcadas como lidas", quantidade: await notificacaoService.marcarTodasComoLidas() }); }
      catch (error) { next(error); }
    },
    async excluir(req, res, next) {
      try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ erro: "ID de notificação inválido" });
        await notificacaoService.excluir(id);
        return res.json({ mensagem: "Notificação removida" });
      } catch (error) { next(error); }
    },
  };
}
