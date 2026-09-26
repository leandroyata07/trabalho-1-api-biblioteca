export class EmprestimoService {
  constructor(emprestimoRepository) {
    this.emprestimoRepository = emprestimoRepository;
  }

  async listar({ skip, take, where, orderBy }) {
    const [dados, total] = await Promise.all([
      this.emprestimoRepository.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.emprestimoRepository.count(where),
    ]);

    return { dados, total };
  }

  async obter(id) {
    return this.emprestimoRepository.findById(id);
  }

  async criar({ livroId, estudanteId }) {
    return this.emprestimoRepository.createWithBookLock({
      livroId,
      estudanteId,
    });
  }

  async atualizar(id, data) {
    return this.emprestimoRepository.updateWithRelations(id, data);
  }

  async excluir(id) {
    const emprestimo = await this.emprestimoRepository.findById(id);

    if (!emprestimo) {
      const error = new Error("Empréstimo não encontrado");
      error.status = 404;
      throw error;
    }

    if (!emprestimo.devolvido) {
      const error = new Error(
        "Não é permitido excluir empréstimo ativo; devolva o livro primeiro"
      );
      error.status = 409;
      throw error;
    }

    return this.emprestimoRepository.delete(id);
  }

  async devolver(id) {
    return this.emprestimoRepository.devolver(id);
  }
}