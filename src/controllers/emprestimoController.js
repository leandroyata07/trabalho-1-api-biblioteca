import { emprestimoRepository } from "../repositories/emprestimoRepository.js";
import { getPagination, buildPage, getDirection } from "../utils/pagination.js";
import { parseId } from "../utils/normalizers.js";

const allowedSorts = new Set(["id", "dataEmprestimo", "dataDevolucao", "devolvido", "createdAt"]);

export async function listarEmprestimos(req, res, next) {
  try {
    const { pagina, limite, skip, take } = getPagination(req);
    const ordenar = allowedSorts.has(req.query.ordenar) ? req.query.ordenar : "id";
    const direcao = getDirection(req.query.direcao);
    const where = {};

    if (req.query.devolvido !== undefined) {
      where.devolvido = String(req.query.devolvido).toLowerCase() === "true";
    }
    if (req.query.livroId) where.livroId = parseId(req.query.livroId) || -1;
    if (req.query.estudanteId) where.estudanteId = parseId(req.query.estudanteId) || -1;

    const [dados, total] = await Promise.all([
      emprestimoRepository.findMany({ skip, take, where, orderBy: { [ordenar]: direcao } }),
      emprestimoRepository.count(where),
    ]);

    return res.json(buildPage(dados, total, pagina, limite));
  } catch (error) {
    next(error);
  }
}

export async function obterEmprestimo(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Empréstimo não encontrado" });
    const emprestimo = await emprestimoRepository.findById(id);
    if (!emprestimo) return res.status(404).json({ erro: "Empréstimo não encontrado" });
    return res.json(emprestimo);
  } catch (error) {
    next(error);
  }
}

export async function criarEmprestimo(req, res, next) {
  try {
    const livroId = parseId(req.body.livroId);
    const estudanteId = parseId(req.body.estudanteId);

    if (!livroId || !estudanteId) {
      return res.status(400).json({ erro: "livroId e estudanteId são obrigatórios" });
    }

    const emprestimo = await emprestimoRepository.createWithBookLock({
      livroId,
      estudanteId,
    });

    return res.status(201).json(emprestimo);
  } catch (error) {
    next(error);
  }
}

export async function atualizarEmprestimo(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Empréstimo não encontrado" });

    const atual = await emprestimoRepository.findById(id);
    if (!atual) return res.status(404).json({ erro: "Empréstimo não encontrado" });
    if (atual.devolvido) return res.status(409).json({ erro: "Empréstimo já devolvido não pode ser alterado" });

    const data = {};
    if (req.body.livroId !== undefined) data.livroId = parseId(req.body.livroId);
    if (req.body.estudanteId !== undefined) data.estudanteId = parseId(req.body.estudanteId);

    if (!Object.keys(data).length) {
      return res.status(400).json({ erro: "Informe livroId ou estudanteId para atualizar" });
    }

    return res.json(await emprestimoRepository.updateWithRelations(id, data));
  } catch (error) {
    next(error);
  }
}

export async function excluirEmprestimo(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Empréstimo não encontrado" });
    const emprestimo = await emprestimoRepository.findById(id);
    if (!emprestimo) return res.status(404).json({ erro: "Empréstimo não encontrado" });

    if (!emprestimo.devolvido) {
      return res.status(409).json({ erro: "Não é permitido excluir empréstimo ativo; devolva o livro primeiro" });
    }

    await emprestimoRepository.delete(id);
    return res.json({ mensagem: "Empréstimo removido com sucesso" });
  } catch (error) {
    next(error);
  }
}

export async function devolverEmprestimo(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ erro: "Empréstimo não encontrado" });
    return res.json(await emprestimoRepository.devolver(id));
  } catch (error) {
    next(error);
  }
}
