import { estudanteRepository } from "../repositories/estudanteRepository.js";
import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { cleanText, parseId } from "../utils/normalizers.js";

const allowedSorts = new Set(["id", "nome", "email", "createdAt", "updatedAt"]);

export async function listarEstudantes(req, res, next) {
  try {
    const { pagina, limite, skip, take } = getPagination(req);
    const nome = cleanText(req.query.nome);
    const ordenar = allowedSorts.has(req.query.ordenar) ? req.query.ordenar : "id";
    const direcao = getDirection(req.query.direcao);
    const where = nome ? { nome: { contains: nome } } : {};
    const [dados, total] = await Promise.all([
      estudanteRepository.findMany({
        skip,
        take,
        where,
        orderBy: { [ordenar]: direcao },
      }),
      estudanteRepository.count(where),
    ]);
    return res.json(buildPage(dados, total, pagina, limite));
  } catch (error) {
    next(error);
  }
}

export async function obterEstudante(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Estudante não encontrado" });
    const estudante = await estudanteRepository.findById(id, true);
    if (!estudante) return res.status(404).json({ erro: "Estudante não encontrado" });
    return res.json(estudante);
  } catch (error) {
    next(error);
  }
}

export async function criarEstudante(req, res, next) {
  try {
    const nome = cleanText(req.body.nome);
    const email = cleanText(req.body.email);
    if (!nome || !email) {
      return res.status(400).json({ erro: "Os campos nome e email são obrigatórios" });
    }
    const estudante = await estudanteRepository.create({ nome, email });
    return res.status(201).json(estudante);
  } catch (error) {
    next(error);
  }
}

export async function atualizarEstudante(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Estudante não encontrado" });
    const data = {};
    if (req.body.nome !== undefined) data.nome = cleanText(req.body.nome);
    if (req.body.email !== undefined) data.email = cleanText(req.body.email);
    if (req.body.ativo !== undefined) data.ativo = Boolean(req.body.ativo);
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ erro: "Informe ao menos um campo para atualizar" });
    }
    const estudante = await estudanteRepository.update(id, data);
    return res.json(estudante);
  } catch (error) {
    next(error);
  }
}

export async function excluirEstudante(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Estudante não encontrado" });
    await estudanteRepository.delete(id);
    return res.json({ mensagem: "Estudante removido com sucesso" });
  } catch (error) {
    next(error);
  }
}
