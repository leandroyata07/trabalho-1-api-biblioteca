import { prisma } from "../lib/prisma.js";

export const emprestimoRepository = {
  findMany({ skip, take, where, orderBy }) {
    return prisma.emprestimo.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        livro: { select: { id: true, titulo: true, isbn: true, disponivel: true } },
        estudante: { select: { id: true, nome: true, email: true } },
      },
    });
  },

  count(where) {
    return prisma.emprestimo.count({ where });
  },

  findById(id) {
    return prisma.emprestimo.findUnique({
      where: { id },
      include: {
        livro: true,
        estudante: true,
      },
    });
  },

  create(data) {
    return prisma.emprestimo.create({
      data,
      include: { livro: true, estudante: true },
    });
  },

  async updateWithRelations(id, { livroId, estudanteId }) {
    return prisma.$transaction(async (tx) => {
      const atual = await tx.emprestimo.findUnique({ where: { id } });
      if (!atual) {
        const error = new Error("Empréstimo não encontrado");
        error.status = 404;
        throw error;
      }
      if (atual.devolvido) {
        const error = new Error("Empréstimo já devolvido não pode ser alterado");
        error.status = 409;
        throw error;
      }

      if (estudanteId !== undefined) {
        const estudante = await tx.estudante.findUnique({ where: { id: estudanteId } });
        if (!estudante) {
          const error = new Error("Estudante não encontrado");
          error.status = 404;
          throw error;
        }
      }

      if (livroId !== undefined && livroId !== atual.livroId) {
        const novoLivro = await tx.livro.findUnique({ where: { id: livroId } });
        if (!novoLivro) {
          const error = new Error("Livro não encontrado");
          error.status = 404;
          throw error;
        }
        if (!novoLivro.disponivel) {
          const error = new Error("Novo livro não está disponível");
          error.status = 409;
          throw error;
        }

        await tx.livro.update({
          where: { id: atual.livroId },
          data: { disponivel: true },
        });
        await tx.livro.update({
          where: { id: livroId },
          data: { disponivel: false },
        });
      }

      return tx.emprestimo.update({
        where: { id },
        data: {
          ...(livroId !== undefined ? { livroId } : {}),
          ...(estudanteId !== undefined ? { estudanteId } : {}),
        },
        include: { livro: true, estudante: true },
      });
    });
  },

  delete(id) {
    return prisma.emprestimo.delete({ where: { id } });
  },

  async createWithBookLock({ livroId, estudanteId }) {
    return prisma.$transaction(async (tx) => {
      const livro = await tx.livro.findUnique({ where: { id: livroId } });
      if (!livro) {
        const error = new Error("Livro não encontrado");
        error.status = 404;
        throw error;
      }

      const estudante = await tx.estudante.findUnique({ where: { id: estudanteId } });
      if (!estudante) {
        const error = new Error("Estudante não encontrado");
        error.status = 404;
        throw error;
      }

      if (!livro.disponivel) {
        const error = new Error("Livro não está disponível");
        error.status = 409;
        throw error;
      }

      const emprestimo = await tx.emprestimo.create({
        data: { livroId, estudanteId },
        include: { livro: true, estudante: true },
      });

      await tx.livro.update({
        where: { id: livroId },
        data: { disponivel: false },
      });

      return emprestimo;
    });
  },

  async devolver(id) {
    return prisma.$transaction(async (tx) => {
      const emprestimo = await tx.emprestimo.findUnique({
        where: { id },
      });

      if (!emprestimo) {
        const error = new Error("Empréstimo não encontrado");
        error.status = 404;
        throw error;
      }

      if (emprestimo.devolvido) {
        const error = new Error("Empréstimo já devolvido");
        error.status = 409;
        throw error;
      }

      const atualizado = await tx.emprestimo.update({
        where: { id },
        data: {
          devolvido: true,
          dataDevolucao: new Date(),
        },
        include: { livro: true, estudante: true },
      });

      await tx.livro.update({
        where: { id: emprestimo.livroId },
        data: { disponivel: true },
      });

      return atualizado;
    });
  },
};
