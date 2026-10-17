export class EmprestimoService {
  constructor(emprestimoRepository, notificacaoService, eventBus) {
    this.emprestimoRepository = emprestimoRepository;
    this.notificacaoService = notificacaoService;
    this.eventBus = eventBus;
  }

  async listar({ skip, take, where, orderBy }) {
    const [dados, total] = await Promise.all([
      this.emprestimoRepository.findMany({ skip, take, where, orderBy }),
      this.emprestimoRepository.count(where),
    ]);
    return { dados, total };
  }
  async obter(id) { return this.emprestimoRepository.findById(id); }

  async criar({ livroId, estudanteId }) {
    const emprestimo = await this.emprestimoRepository.createWithBookLock({ livroId, estudanteId });
    const notificacao = await this.notificacaoService.criar({
      tipo: "EMPRESTIMO_CRIADO", titulo: "Novo empréstimo registrado",
      mensagem: `${emprestimo.estudante.nome} pegou o livro “${emprestimo.livro.titulo}”.`,
      emprestimoId: emprestimo.id,
    });
    this.eventBus.publish("emprestimo:criado", emprestimo);
    this.eventBus.publish("livro:disponibilidade", { livroId: emprestimo.livroId, disponivel: false, livro: emprestimo.livro });
    this.eventBus.publish("notificacao:nova", notificacao);
    this.eventBus.publish("painel:atualizar", { motivo: "emprestimo:criado" });
    return emprestimo;
  }
  async atualizar(id, data) {
    const emprestimo = await this.emprestimoRepository.updateWithRelations(id, data);
    this.eventBus.publish("emprestimo:atualizado", emprestimo);
    this.eventBus.publish("painel:atualizar", { motivo: "emprestimo:atualizado" });
    return emprestimo;
  }
  async excluir(id) {
    const emprestimo = await this.emprestimoRepository.findById(id);
    if (!emprestimo) { const error = new Error("Empréstimo não encontrado"); error.status = 404; throw error; }
    if (!emprestimo.devolvido) { const error = new Error("Não é permitido excluir empréstimo ativo; devolva o livro primeiro"); error.status = 409; throw error; }
    const removido = await this.emprestimoRepository.delete(id);
    this.eventBus.publish("emprestimo:excluido", { id });
    this.eventBus.publish("painel:atualizar", { motivo: "emprestimo:excluido" });
    return removido;
  }
  async devolver(id) {
    const emprestimo = await this.emprestimoRepository.devolver(id);
    const notificacao = await this.notificacaoService.criar({
      tipo: "EMPRESTIMO_DEVOLVIDO", titulo: "Livro devolvido",
      mensagem: `“${emprestimo.livro.titulo}” foi devolvido por ${emprestimo.estudante.nome}.`,
      emprestimoId: emprestimo.id,
    });
    this.eventBus.publish("emprestimo:devolvido", emprestimo);
    this.eventBus.publish("livro:disponibilidade", { livroId: emprestimo.livroId, disponivel: true, livro: emprestimo.livro });
    this.eventBus.publish("notificacao:nova", notificacao);
    this.eventBus.publish("painel:atualizar", { motivo: "emprestimo:devolvido" });
    return emprestimo;
  }
}
