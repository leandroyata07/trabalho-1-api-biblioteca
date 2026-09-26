import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { cleanText, parseId } from "../utils/normalizers.js";

const allowedSorts = new Set([
  "id",
  "nome",
  "email",
  "createdAt",
  "updatedAt",
]);

export function criarEstudanteController(estudanteService) {
  return {
    async listar(req, res, next) {
      try {
        const { pagina, limite, skip, take } = getPagination(req);
        const nome = cleanText(req.query.nome);
        const ordenar = allowedSorts.has(req.query.ordenar)
          ? req.query.ordenar
          : "id";
        const direcao = getDirection(req.query.direcao);

        const { dados, total } = await estudanteService.listar({
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
            erro: "Estudante não encontrado",
          });
        }

        const estudante = await estudanteService.obter(id);

        if (!estudante) {
          return res.status(404).json({
            erro: "Estudante não encontrado",
          });
        }

        return res.json(estudante);
      } catch (error) {
        next(error);
      }
    },

    async criar(req, res, next) {
      try {
        const estudante = await estudanteService.criar(req.body);

        return res.status(201).json(estudante);
      } catch (error) {
        next(error);
      }
    },

    async atualizar(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Estudante não encontrado",
          });
        }

        const estudanteAtual = await estudanteService.obter(id);

        if (!estudanteAtual) {
          return res.status(404).json({
            erro: "Estudante não encontrado",
          });
        }

        const estudante = await estudanteService.atualizar(
          id,
          req.body
        );

        return res.json(estudante);
      } catch (error) {
        next(error);
      }
    },

    async excluir(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Estudante não encontrado",
          });
        }

        await estudanteService.excluir(id);

        return res.json({
          mensagem: "Estudante removido com sucesso",
        });
      } catch (error) {
        next(error);
      }
    },
  };
}