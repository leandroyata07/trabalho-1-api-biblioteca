import { autorRepository } from "../repositories/autorRepository.js";
import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { cleanText, parseId } from "../utils/normalizers.js";

const allowedSorts = new Set(["id", "nome", "email", "createdAt", "updatedAt"]);

export async function listarAutores(req, res, next) {
  try {
    const { pagina, limite, skip, take } = getPagination(req);
    const nome = cleanText(req.query.nome);
    const ordenar = allowedSorts.has(req.query.ordenar) ? req.query.ordenar : "id";
    const direcao = getDirection(req.query.direcao);
    const where = nome ? { nome: { contains: nome } } : {};
    const [dados, total] = await Promise.all([
      autorRepository.findMany({ skip, take, where, orderBy: { [ordenar]: direcao } }),
      autorRepository.count(where),
    ]);
    return res.json(buildPage(dados, total, pagina, limite));
  } catch (error) {
    next(error);
  }
}

export async function obterAutor(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Autor não encontrado" });
    const autor = await autorRepository.findById(id);
    if (!autor) return res.status(404).json({ erro: "Autor não encontrado" });
    return res.json(autor);
  } catch (error) {
    next(error);
  }
}

export async function criarAutor(req, res, next) {
  try {
    const nome = cleanText(req.body.nome);
    const email = cleanText(req.body.email);
    if (!nome || !email) {
      return res.status(400).json({ erro: "Os campos nome e email são obrigatórios" });
    }
    const autor = await autorRepository.create({ nome, email });
    return res.status(201).json(autor);
  } catch (error) {
    next(error);
  }
}

export async function atualizarAutor(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Autor não encontrado" });
    const data = {};
    if (req.body.nome !== undefined) data.nome = cleanText(req.body.nome);
    if (req.body.email !== undefined) data.email = cleanText(req.body.email);
    if (!Object.keys(data).length) {
      return res.status(400).json({ erro: "Informe ao menos um campo para atualizar" });
    }
    return res.json(await autorRepository.update(id, data));
  } catch (error) {
    next(error);
  }
}

export async function excluirAutor(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Autor não encontrado" });
    await autorRepository.delete(id);
    return res.json({ mensagem: "Autor removido com sucesso" });
  } catch (error) {
    next(error);
  }
}
