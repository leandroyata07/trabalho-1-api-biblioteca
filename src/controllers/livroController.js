import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { cleanText, mapLivro, parseId } from "../utils/normalizers.js";

const allowedSorts = new Set([
  "id",
  "titulo",
  "isbn",
  "disponivel",
  "createdAt",
  "updatedAt",
]);

export function criarLivroController(livroService) {
  return {
    async listar(req, res, next) {
      try {
        const { pagina, limite, skip, take } = getPagination(req);
        const titulo = cleanText(req.query.titulo);
        const autor = cleanText(req.query.autor);

        const ordenar = allowedSorts.has(req.query.ordenar)
          ? req.query.ordenar
          : "id";

        const direcao = getDirection(req.query.direcao);

        const { dados, total } = await livroService.listar({
          skip,
          take,
          titulo,
          autor,
          orderBy: { [ordenar]: direcao },
        });

        return res.json(
          buildPage(dados.map(mapLivro), total, pagina, limite)
        );
      } catch (error) {
        next(error);
      }
    },

    async obter(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Livro não encontrado",
          });
        }

        const livro = await livroService.obter(id);

        if (!livro) {
          return res.status(404).json({
            erro: "Livro não encontrado",
          });
        }

        return res.json(mapLivro(livro));
      } catch (error) {
        next(error);
      }
    },

    async criar(req, res, next) {
      try {
        const livro = await livroService.criar(req.body);

        return res.status(201).json(mapLivro(livro));
      } catch (error) {
        next(error);
      }
    },

    async atualizar(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Livro não encontrado",
          });
        }

        const livro = await livroService.atualizar(id, req.body);

        return res.json(mapLivro(livro));
      } catch (error) {
        next(error);
      }
    },

    async excluir(req, res, next) {
      try {
        const id = parseId(req.params.id);

        if (!id) {
          return res.status(404).json({
            erro: "Livro não encontrado",
          });
        }

        await livroService.excluir(id);

        return res.json({
          mensagem: "Livro removido com sucesso",
        });
      } catch (error) {
        next(error);
      }
    },
  };
}