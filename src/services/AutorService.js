import { cleanText } from "../utils/normalizers.js";

export class AutorService {
  constructor(autorRepository) {
    this.autorRepository = autorRepository;
  }

  async listar({ skip, take, nome, orderBy }) {
    const where = nome ? { nome: { contains: nome } } : {};

    const [dados, total] = await Promise.all([
      this.autorRepository.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.autorRepository.count(where),
    ]);

    return { dados, total };
  }

  async obter(id) {
    return this.autorRepository.findById(id);
  }

  async criar(body) {
    const nome = cleanText(body.nome);
    const email = cleanText(body.email);

    if (!nome || !email) {
      const error = new Error("Os campos nome e email são obrigatórios");
      error.status = 400;
      throw error;
    }

    return this.autorRepository.create({
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

    if (!Object.keys(data).length) {
      const error = new Error("Informe ao menos um campo para atualizar");
      error.status = 400;
      throw error;
    }

    return this.autorRepository.update(id, data);
  }

  async excluir(id) {
    return this.autorRepository.delete(id);
  }
}