import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { cleanText, parseId } from "../utils/normalizers.js";

const allowedSorts = new Set([
  "id",
  "nome",
  "email",
  "createdAt",
  "updatedAt",
]);

export function criarAutorController(autorService) {
  return {
    async listar(req, res, next) {
      try {
        const { pagina, limite, skip, take } = getPagination(req);
        const nome = cleanText(req.query.nome);
        const ordenar = allowedSorts.has(req.query.ordenar)
          ? req.query.ordenar
          : "id";
        const direcao = getDirection(req.query.direcao);

        const { dados, total } = await autorService.listar({
          skip,
          take,
          nome,
          orderBy: { [ordenar]: direcao },
        });

        return res.json(buildPage(dados, total, pagina, limite));
      } catch (error) {
        next(error);
      }
    },

    async obter(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Autor não encontrado",
          });
        }

        const autor = await autorService.obter(id);

        if (!autor) {
          return res.status(404).json({
            erro: "Autor não encontrado",
          });
        }

        return res.json(autor);
      } catch (error) {
        next(error);
      }
    },

    async criar(req, res, next) {
      try {
        const autor = await autorService.criar(req.body);

        return res.status(201).json(autor);
      } catch (error) {
        next(error);
      }
    },

    async atualizar(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Autor não encontrado",
          });
        }

        const autorAtual = await autorService.obter(id);

        if (!autorAtual) {
          return res.status(404).json({
            erro: "Autor não encontrado",
          });
        }

        const autor = await autorService.atualizar(id, req.body);

        return res.json(autor);
      } catch (error) {
        next(error);
      }
    },

    async excluir(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Autor não encontrado",
          });
        }

        await autorService.excluir(id);

        return res.json({
          mensagem: "Autor removido com sucesso",
        });
      } catch (error) {
        next(error);
      }
    },
  };
}