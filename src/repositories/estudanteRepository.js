import { prisma } from "../lib/prisma.js";

export const estudanteRepository = {
  findMany({ skip, take, where, orderBy }) {
    return prisma.estudante.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: { select: { emprestimos: true } },
      },
    });
  },

  count(where) {
    return prisma.estudante.count({ where });
  },

  findById(id, includeEmprestimos = true) {
    return prisma.estudante.findUnique({
      where: { id },
      include: includeEmprestimos
        ? {
            emprestimos: {
              orderBy: { dataEmprestimo: "desc" },
              include: {
                livro: {
                  select: { id: true, titulo: true, isbn: true },
                },
              },
            },
          }
        : undefined,
    });
  },

  create(data) {
    return prisma.estudante.create({ data });
  },

  update(id, data) {
    return prisma.estudante.update({ where: { id }, data });
  },

  delete(id) {
    return prisma.estudante.delete({ where: { id } });
  },
};
