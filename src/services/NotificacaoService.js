export class NotificacaoService {
  constructor(notificacaoRepository, eventBus) {
    this.notificacaoRepository = notificacaoRepository;
    this.eventBus = eventBus;
  }
  listar({ skip, take, where }) {
    return Promise.all([
      this.notificacaoRepository.findMany({ skip, take, where }),
      this.notificacaoRepository.count(where),
    ]).then(([dados, total]) => ({ dados, total }));
  }
  contarNaoLidas() { return this.notificacaoRepository.countUnread(); }
  criar(data) { return this.notificacaoRepository.create(data); }
  async marcarComoLida(id) {
    const existente = await this.notificacaoRepository.findById(id);
    if (!existente) { const error = new Error("Notificação não encontrada"); error.status = 404; throw error; }
    if (existente.lida) return existente;
    const atualizada = await this.notificacaoRepository.marcarComoLida(id);
    this.eventBus.publish("notificacao:lida", atualizada);
    this.eventBus.publish("painel:atualizar", { motivo: "notificacao:lida" });
    return atualizada;
  }
  async marcarTodasComoLidas() {
    const quantidade = await this.notificacaoRepository.marcarTodasComoLidas();
    this.eventBus.publish("notificacao:lidas-todas", { quantidade });
    this.eventBus.publish("painel:atualizar", { motivo: "notificacoes:lidas-todas" });
    return quantidade;
  }
  async excluir(id) {
    const existente = await this.notificacaoRepository.findById(id);
    if (!existente) { const error = new Error("Notificação não encontrada"); error.status = 404; throw error; }
    return this.notificacaoRepository.delete(id);
  }
}
