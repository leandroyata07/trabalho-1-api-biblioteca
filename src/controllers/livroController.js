import { livroRepository } from "../repositories/livroRepository.js";
import { autorRepository } from "../repositories/autorRepository.js";
import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { cleanText, mapLivro, parseId } from "../utils/normalizers.js";

const allowedSorts = new Set(["id", "titulo", "isbn", "disponivel", "createdAt", "updatedAt"]);

async function resolveAuthorIds(body) {
  if (Array.isArray(body.autorIds)) {
    const ids = [...new Set(body.autorIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
    return ids;
  }

  if (body.autor) {
    const nome = cleanText(body.autor);
    if (!nome) return [];
    let autor = await autorRepository.findByName(nome);
    if (!autor) {
      const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
      autor = await autorRepository.create({
        nome,
        email: `${slug || "autor"}@biblioteca.local`,
      });
    }
    return [autor.id];
  }

  return [];
}

export async function listarLivros(req, res, next) {
  try {
    const { pagina, limite, skip, take } = getPagination(req);
    const titulo = cleanText(req.query.titulo);
    const autor = cleanText(req.query.autor);
    const ordenar = allowedSorts.has(req.query.ordenar) ? req.query.ordenar : "id";
    const direcao = getDirection(req.query.direcao);

    const where = {
      ...(titulo ? { titulo: { contains: titulo } } : {}),
      ...(autor ? {
        autores: {
          some: {
            autor: { nome: { contains: autor } },
          },
        },
      } : {}),
    };

    const [dadosBrutos, total] = await Promise.all([
      livroRepository.findMany({ skip, take, where, orderBy: { [ordenar]: direcao } }),
      livroRepository.count(where),
    ]);

    return res.json(buildPage(dadosBrutos.map(mapLivro), total, pagina, limite));
  } catch (error) {
    next(error);
  }
}

export async function obterLivro(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Livro não encontrado" });
    const livro = await livroRepository.findById(id);
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });
    return res.json(mapLivro(livro));
  } catch (error) {
    next(error);
  }
}

export async function criarLivro(req, res, next) {
  try {
    const titulo = cleanText(req.body.titulo);
    const isbn = cleanText(req.body.isbn);

    if (!titulo || !isbn) {
      return res.status(400).json({ erro: "Os campos titulo e isbn são obrigatórios" });
    }

    const autorIds = await resolveAuthorIds(req.body);
    const data = {
      titulo,
      isbn,
      disponivel: req.body.disponivel !== undefined ? Boolean(req.body.disponivel) : true,
      ...(autorIds.length
        ? { autores: { create: autorIds.map((autorId) => ({ autor: { connect: { id: autorId } } })) } }
        : {}),
    };

    const livro = await livroRepository.create(data);
    return res.status(201).json(mapLivro(livro));
  } catch (error) {
    next(error);
  }
}

export async function atualizarLivro(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Livro não encontrado" });

    const data = {};
    if (req.body.titulo !== undefined) data.titulo = cleanText(req.body.titulo);
    if (req.body.isbn !== undefined) data.isbn = cleanText(req.body.isbn);
    if (req.body.disponivel !== undefined) data.disponivel = Boolean(req.body.disponivel);

    if (Array.isArray(req.body.autorIds)) {
      const autorIds = [...new Set(req.body.autorIds.map(Number).filter((value) => Number.isInteger(value) && value > 0))];
      data.autores = {
        deleteMany: {},
        create: autorIds.map((autorId) => ({ autor: { connect: { id: autorId } } })),
      };
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({ erro: "Informe ao menos um campo para atualizar" });
    }

    const livro = await livroRepository.update(id, data);
    return res.json(mapLivro(livro));
  } catch (error) {
    next(error);
  }
}

export async function excluirLivro(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Livro não encontrado" });
    await livroRepository.delete(id);
    return res.json({ mensagem: "Livro removido com sucesso" });
  } catch (error) {
    next(error);
  }
}
