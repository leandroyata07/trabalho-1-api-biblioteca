import { cleanText } from "../utils/normalizers.js";

export class LivroService {
  constructor(livroRepository, autorRepository) {
    this.livroRepository = livroRepository;
    this.autorRepository = autorRepository;
  }

  async resolverAutorIds(body) {
    if (Array.isArray(body.autorIds)) {
      return [
        ...new Set(
          body.autorIds
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0)
        ),
      ];
    }

    if (body.autor) {
      const nome = cleanText(body.autor);

      if (!nome) {
        return [];
      }

      let autor = await this.autorRepository.findByName(nome);

      if (!autor) {
        const slug = nome
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "");

        autor = await this.autorRepository.create({
          nome,
          email: `${slug || "autor"}@biblioteca.local`,
        });
      }

      return [autor.id];
    }

    return [];
  }

  async listar({ skip, take, titulo, autor, orderBy }) {
    const where = {
      ...(titulo ? { titulo: { contains: titulo } } : {}),
      ...(autor
        ? {
            autores: {
              some: {
                autor: {
                  nome: { contains: autor },
                },
              },
            },
          }
        : {}),
    };

    const [dados, total] = await Promise.all([
      this.livroRepository.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.livroRepository.count(where),
    ]);

    return { dados, total };
  }

  async obter(id) {
    return this.livroRepository.findById(id);
  }

  async criar(body) {
    const titulo = cleanText(body.titulo);
    const isbn = cleanText(body.isbn);

    if (!titulo || !isbn) {
      const error = new Error("Os campos titulo e isbn são obrigatórios");
      error.status = 400;
      throw error;
    }

    const autorIds = await this.resolverAutorIds(body);

    const data = {
      titulo,
      isbn,
      disponivel:
        body.disponivel !== undefined ? Boolean(body.disponivel) : true,
      ...(autorIds.length
        ? {
            autores: {
              create: autorIds.map((autorId) => ({
                autor: { connect: { id: autorId } },
              })),
            },
          }
        : {}),
    };

    return this.livroRepository.create(data);
  }

  async atualizar(id, body) {
    const data = {};

    if (body.titulo !== undefined) {
      data.titulo = cleanText(body.titulo);
    }

    if (body.isbn !== undefined) {
      data.isbn = cleanText(body.isbn);
    }

    if (body.disponivel !== undefined) {
      data.disponivel = Boolean(body.disponivel);
    }

    if (Array.isArray(body.autorIds)) {
      const autorIds = [
        ...new Set(
          body.autorIds
            .map(Number)
            .filter((value) => Number.isInteger(value) && value > 0)
        ),
      ];

      data.autores = {
        deleteMany: {},
        create: autorIds.map((autorId) => ({
          autor: { connect: { id: autorId } },
        })),
      };
    }

    if (!Object.keys(data).length) {
      const error = new Error("Informe ao menos um campo para atualizar");
      error.status = 400;
      throw error;
    }

    return this.livroRepository.update(id, data);
  }

  async excluir(id) {
    return this.livroRepository.delete(id);
  }
}