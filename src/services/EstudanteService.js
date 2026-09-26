import { cleanText } from "../utils/normalizers.js";

export class EstudanteService {
  constructor(estudanteRepository) {
    this.estudanteRepository = estudanteRepository;
  }

  async listar({ skip, take, nome, orderBy }) {
    const where = nome ? { nome: { contains: nome } } : {};

    const [dados, total] = await Promise.all([
      this.estudanteRepository.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.estudanteRepository.count(where),
    ]);

    return { dados, total };
  }

  async obter(id) {
    return this.estudanteRepository.findById(id, true);
  }

  async criar(body) {
    const nome = cleanText(body.nome);
    const email = cleanText(body.email);

    if (!nome || !email) {
      const error = new Error("Os campos nome e email são obrigatórios");
      error.status = 400;
      throw error;
    }

    return this.estudanteRepository.create({
      nome,
      email,
    });
  }

  async atualizar(id, body) {
    const data = {};

    if (body.nome !== undefined) {
      data.nome = cleanText(body.nome);
    }

    if (body.email !== undefined) {
      data.email = cleanText(body.email);
    }

    if (body.ativo !== undefined) {
      data.ativo = Boolean(body.ativo);
    }

    if (!Object.keys(data).length) {
      const error = new Error("Informe ao menos um campo para atualizar");
      error.status = 400;
      throw error;
    }

    return this.estudanteRepository.update(id, data);
  }

  async excluir(id) {
    return this.estudanteRepository.delete(id);
  }
}