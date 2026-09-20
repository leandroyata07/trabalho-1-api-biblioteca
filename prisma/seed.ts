import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const estudantes = [
  ["Ana Souza", "ana@example.com"],
  ["Bruno Lima", "bruno@example.com"],
  ["Carla Santos", "carla@example.com"],
  ["Diego Oliveira", "diego@example.com"],
  ["Eduarda Alves", "eduarda@example.com"],
  ["Felipe Costa", "felipe@example.com"],
  ["Gabriela Rocha", "gabriela@example.com"],
  ["Henrique Martins", "henrique@example.com"],
  ["Isabela Ferreira", "isabela@example.com"],
  ["João Pereira", "joao@example.com"],
] as const;

const autores = [
  ["Machado de Assis", "machado@biblioteca.local"],
  ["Jorge Amado", "jorge@biblioteca.local"],
  ["Clarice Lispector", "clarice@biblioteca.local"],
  ["Monteiro Lobato", "lobato@biblioteca.local"],
  ["Carlos Drummond de Andrade", "drummond@biblioteca.local"],
  ["Graciliano Ramos", "graciliano@biblioteca.local"],
  ["Cecília Meireles", "cecilia@biblioteca.local"],
  ["José de Alencar", "alencar@biblioteca.local"],
  ["Lygia Fagundes Telles", "lygia@biblioteca.local"],
  ["Lima Barreto", "lima@biblioteca.local"],
] as const;

const livros = [
  ["Dom Casmurro", "9780000000001", "machado@biblioteca.local"],
  ["Capitães da Areia", "9780000000002", "jorge@biblioteca.local"],
  ["A Hora da Estrela", "9780000000003", "clarice@biblioteca.local"],
  ["O Sítio do Picapau Amarelo", "9780000000004", "lobato@biblioteca.local"],
  ["Alguma Poesia", "9780000000005", "drummond@biblioteca.local"],
  ["Vidas Secas", "9780000000006", "graciliano@biblioteca.local"],
  ["Romanceiro da Inconfidência", "9780000000007", "cecilia@biblioteca.local"],
  ["Iracema", "9780000000008", "alencar@biblioteca.local"],
  ["As Meninas", "9780000000009", "lygia@biblioteca.local"],
  ["Triste Fim de Policarpo Quaresma", "9780000000010", "lima@biblioteca.local"],
  ["Memórias Póstumas de Brás Cubas", "9780000000011", "machado@biblioteca.local"],
  ["Gabriela, Cravo e Canela", "9780000000012", "jorge@biblioteca.local"],
] as const;

async function main() {
  await prisma.emprestimo.deleteMany();
  await prisma.livroAutor.deleteMany();
  await prisma.livro.deleteMany();
  await prisma.autor.deleteMany();
  await prisma.estudante.deleteMany();

  for (const [nome, email] of estudantes) {
    await prisma.estudante.create({ data: { nome, email } });
  }

  for (const [nome, email] of autores) {
    await prisma.autor.create({ data: { nome, email } });
  }

  const livrosCriados = [] as { id: number; titulo: string }[];

  for (const [titulo, isbn, autorEmail] of livros) {
    const autor = await prisma.autor.findUniqueOrThrow({
      where: { email: autorEmail },
    });

    const livro = await prisma.livro.create({
      data: {
        titulo,
        isbn,
        autores: {
          create: [{ autor: { connect: { id: autor.id } } }],
        },
      },
    });

    livrosCriados.push({ id: livro.id, titulo: livro.titulo });
  }

  const estudantesCriados = await prisma.estudante.findMany({
    orderBy: { id: "asc" },
  });

  for (let i = 0; i < 10; i += 1) {
    const livro = livrosCriados[i];
    const estudante = estudantesCriados[i];
    const devolvido = i < 5;

    await prisma.emprestimo.create({
      data: {
        livroId: livro.id,
        estudanteId: estudante.id,
        devolvido,
        dataDevolucao: devolvido ? new Date() : null,
      },
    });

    if (!devolvido) {
      await prisma.livro.update({
        where: { id: livro.id },
        data: { disponivel: false },
      });
    }
  }

  console.log("Seed concluído.");
  console.log(`Estudantes: ${await prisma.estudante.count()}`);
  console.log(`Autores: ${await prisma.autor.count()}`);
  console.log(`Livros: ${await prisma.livro.count()}`);
  console.log(`Empréstimos: ${await prisma.emprestimo.count()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
