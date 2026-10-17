import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const estudantes = [
  ["Ana Souza", "ana@example.com"], ["Bruno Lima", "bruno@example.com"],
  ["Carla Santos", "carla@example.com"], ["Diego Oliveira", "diego@example.com"],
  ["Eduarda Alves", "eduarda@example.com"], ["Felipe Costa", "felipe@example.com"],
  ["Gabriela Rocha", "gabriela@example.com"], ["Henrique Martins", "henrique@example.com"],
  ["Isabela Ferreira", "isabela@example.com"], ["João Pereira", "joao@example.com"],
] as const;
const autores = [
  ["Machado de Assis", "machado@biblioteca.local"], ["Jorge Amado", "jorge@biblioteca.local"],
  ["Clarice Lispector", "clarice@biblioteca.local"], ["Monteiro Lobato", "lobato@biblioteca.local"],
  ["Carlos Drummond de Andrade", "drummond@biblioteca.local"], ["Graciliano Ramos", "graciliano@biblioteca.local"],
  ["Cecília Meireles", "cecilia@biblioteca.local"], ["José de Alencar", "alencar@biblioteca.local"],
  ["Lygia Fagundes Telles", "lygia@biblioteca.local"], ["Lima Barreto", "lima@biblioteca.local"],
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
  for (const [nome, email] of estudantes) {
    await prisma.estudante.upsert({ where: { email }, update: {}, create: { nome, email } });
  }
  for (const [nome, email] of autores) {
    await prisma.autor.upsert({ where: { email }, update: {}, create: { nome, email } });
  }
  for (const [titulo, isbn, email] of livros) {
    const autor = await prisma.autor.findUniqueOrThrow({ where: { email } });
    await prisma.livro.upsert({
      where: { isbn }, update: {},
      create: { titulo, isbn, autores: { create: [{ autor: { connect: { id: autor.id } } }] } },
    });
  }
  const livrosCriados = await prisma.livro.findMany({ orderBy: { id: "asc" } });
  const estudantesCriados = await prisma.estudante.findMany({ orderBy: { id: "asc" } });
  for (let i = 0; i < Math.min(5, livrosCriados.length, estudantesCriados.length); i += 1) {
    const livro = livrosCriados[i];
    const estudante = estudantesCriados[i];
    const existente = await prisma.emprestimo.findFirst({ where: { livroId: livro.id, estudanteId: estudante.id } });
    if (!existente) {
      await prisma.emprestimo.create({ data: { livroId: livro.id, estudanteId: estudante.id, devolvido: i < 2, dataDevolucao: i < 2 ? new Date() : null } });
      if (i >= 2) await prisma.livro.update({ where: { id: livro.id }, data: { disponivel: false } });
    }
  }
  console.log("Seed concluído sem apagar dados existentes.");
  console.log(`Estudantes: ${await prisma.estudante.count()}`);
  console.log(`Autores: ${await prisma.autor.count()}`);
  console.log(`Livros: ${await prisma.livro.count()}`);
  console.log(`Empréstimos: ${await prisma.emprestimo.count()}`);
  console.log(`Notificações: ${await prisma.notificacao.count()}`);
}
main().catch((error) => { console.error("Erro no seed:", error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
