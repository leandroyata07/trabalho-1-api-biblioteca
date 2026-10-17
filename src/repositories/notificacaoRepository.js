import { prisma } from "../lib/prisma.js";

export const notificacaoRepository = {
  findMany({ skip, take, where }) {
    return prisma.notificacao.findMany({
      skip, take, where, orderBy: { createdAt: "desc" },
      include: { emprestimo: { include: { livro: true, estudante: true } } },
    });
  },
  count(where) { return prisma.notificacao.count({ where }); },
  countUnread() { return prisma.notificacao.count({ where: { lida: false } }); },
  findById(id) { return prisma.notificacao.findUnique({ where: { id } }); },
  create(data) { return prisma.notificacao.create({ data }); },
  marcarComoLida(id) { return prisma.notificacao.update({ where: { id }, data: { lida: true } }); },
  async marcarTodasComoLidas() {
    const resultado = await prisma.notificacao.updateMany({ where: { lida: false }, data: { lida: true } });
    return resultado.count;
  },
  delete(id) { return prisma.notificacao.delete({ where: { id } }); },
};
