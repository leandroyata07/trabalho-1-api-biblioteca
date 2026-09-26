import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { parseId } from "../utils/normalizers.js";

const allowedSorts = new Set([
  "id",
  "dataEmprestimo",
  "dataDevolucao",
  "devolvido",
  "createdAt",
]);

export function criarEmprestimoController(emprestimoService) {
  return {
    async listar(req, res, next) {
      try {
        const { pagina, limite, skip, take } = getPagination(req);
        const ordenar = allowedSorts.has(req.query.ordenar)
          ? req.query.ordenar
          : "id";
        const direcao = getDirection(req.query.direcao);

        const where = {};

        if (req.query.devolvido !== undefined) {
          where.devolvido =
            String(req.query.devolvido).toLowerCase() === "true";
        }

        if (req.query.livroId) {
          where.livroId = parseId(req.query.livroId) || -1;
        }

        if (req.query.estudanteId) {
          where.estudanteId = parseId(req.query.estudanteId) || -1;
        }

        const { dados, total } = await emprestimoService.listar({
          skip,
          take,
          where,
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
            erro: "Empréstimo não encontrado",
          });
        }

        const emprestimo = await emprestimoService.obter(id);

        if (!emprestimo) {
          return res.status(404).json({
            erro: "Empréstimo não encontrado",
          });
        }

        return res.json(emprestimo);
      } catch (error) {
        next(error);
      }
    },

    async criar(req, res, next) {
      try {
        const livroId = parseId(req.body.livroId);
        const estudanteId = parseId(req.body.estudanteId);

        if (!livroId || !estudanteId) {
          return res.status(400).json({
            erro: "livroId e estudanteId são obrigatórios",
          });
        }

        const emprestimo = await emprestimoService.criar({
          livroId,
          estudanteId,
        });

        return res.status(201).json(emprestimo);
      } catch (error) {
        next(error);
      }
    },

    async atualizar(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Empréstimo não encontrado",
          });
        }

        const atual = await emprestimoService.obter(id);

        if (!atual) {
          return res.status(404).json({
            erro: "Empréstimo não encontrado",
          });
        }

        const data = {};

        if (req.body.livroId !== undefined) {
          data.livroId = parseId(req.body.livroId);
        }

        if (req.body.estudanteId !== undefined) {
          data.estudanteId = parseId(req.body.estudanteId);
        }

        if (!Object.keys(data).length) {
          return res.status(400).json({
            erro: "Informe livroId ou estudanteId para atualizar",
          });
        }

        const emprestimo = await emprestimoService.atualizar(id, data);

        return res.json(emprestimo);
      } catch (error) {
        next(error);
      }
    },

    async excluir(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Empréstimo não encontrado",
          });
        }

        await emprestimoService.excluir(id);

        return res.json({
          mensagem: "Empréstimo removido com sucesso",
        });
      } catch (error) {
        next(error);
      }
    },

    async devolver(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Empréstimo não encontrado",
          });
        }

        const emprestimo = await emprestimoService.devolver(id);

        return res.json(emprestimo);
      } catch (error) {
        next(error);
      }
    },
  };
}