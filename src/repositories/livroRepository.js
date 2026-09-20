import { prisma } from "../lib/prisma.js";

export const livroRepository = {
  findMany({ skip, take, where, orderBy }) {
    return prisma.livro.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        autores: {
          include: { autor: true },
        },
        _count: { select: { emprestimos: true } },
      },
    });
  },

  count(where) {
    return prisma.livro.count({ where });
  },

  findById(id) {
    return prisma.livro.findUnique({
      where: { id },
      include: {
        autores: {
          include: { autor: true },
        },
        emprestimos: {
          orderBy: { dataEmprestimo: "desc" },
          include: {
            estudante: {
              select: { id: true, nome: true, email: true },
            },
          },
        },
      },
    });
  },

  create(data) {
    return prisma.livro.create({
      data,
      include: { autores: { include: { autor: true } } },
    });
  },

  update(id, data) {
    return prisma.livro.update({
      where: { id },
      data,
      include: { autores: { include: { autor: true } } },
    });
  },

  delete(id) {
    return prisma.livro.delete({ where: { id } });
  },
};
