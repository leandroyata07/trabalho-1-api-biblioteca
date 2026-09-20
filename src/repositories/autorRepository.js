import { prisma } from "../lib/prisma.js";

export const autorRepository = {
  findMany({ skip, take, where, orderBy }) {
    return prisma.autor.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: { select: { livros: true } },
      },
    });
  },

  count(where) {
    return prisma.autor.count({ where });
  },

  findByName(nome) {
    return prisma.autor.findFirst({ where: { nome: { equals: nome } } });
  },

  findById(id) {
    return prisma.autor.findUnique({
      where: { id },
      include: {
        livros: {
          include: {
            livro: true,
          },
        },
      },
    });
  },

  create(data) {
    return prisma.autor.create({ data });
  },

  update(id, data) {
    return prisma.autor.update({ where: { id }, data });
  },

  delete(id) {
    return prisma.autor.delete({ where: { id } });
  },
};
