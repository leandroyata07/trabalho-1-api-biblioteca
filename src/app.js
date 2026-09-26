import "dotenv/config";
import express from "express";
import livrosRoutes from "./routes/livroRoutes.js";
import estudantesRoutes from "./routes/estudanteRoutes.js";
import autoresRoutes from "./routes/autorRoutes.js";
import emprestimosRoutes from "./routes/emprestimoRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { prisma } from "./lib/prisma.js";
/* global process, console */

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensagem: "API Biblioteca funcionando com Prisma ORM e SQLite",
    recursos: ["/livros", "/estudantes", "/autores", "/emprestimos"],
    documentacao: "/openapi.json",
  });
});

app.get("/docs", (req, res) => {
  res.type("html").send(`
    <h1>API Biblioteca - Trabalho 2</h1>
    <p>API REST com Express, Prisma ORM e SQLite.</p>
    <ul>
      <li>GET/POST/PUT/DELETE /livros</li>
      <li>GET/POST/PUT/DELETE /estudantes</li>
      <li>GET/POST/PUT/DELETE /autores</li>
      <li>GET/POST/PUT/DELETE /emprestimos</li>
      <li>PUT /emprestimos/:id/devolver</li>
    </ul>
    <p>Listagens aceitam paginação com ?pagina=1&limite=10 e ordenação com ?ordenar=nome&direcao=asc.</p>
  `);
});

app.get("/openapi.json", (req, res) => {
  res.json({
    openapi: "3.0.0",

    info: {
      title: "API Biblioteca - Trabalho 2",
      version: "2.0.0",
      description: "API de biblioteca persistida com Prisma ORM e SQLite",
    },

    paths: {
      "/livros": {
        get: {
          summary: "Lista livros com filtro, paginação e ordenação",
        },
        post: {
          summary: "Cadastra livro",
        },
      },

      "/livros/{id}": {
        get: {
          summary: "Consulta livro e seus autores/empréstimos",
        },
        put: {
          summary: "Atualiza livro",
        },
        delete: {
          summary: "Remove livro respeitando integridade",
        },
      },

      "/estudantes": {
        get: {
          summary: "Lista estudantes com filtro, paginação e ordenação",
        },
        post: {
          summary: "Cadastra estudante",
        },
      },

      "/estudantes/{id}": {
        get: {
          summary: "Consulta estudante com empréstimos relacionados",
        },
        put: {
          summary: "Atualiza estudante",
        },
        delete: {
          summary: "Remove estudante respeitando integridade",
        },
      },

      "/autores": {
        get: {
          summary: "Lista autores",
        },
        post: {
          summary: "Cadastra autor",
        },
      },

      "/autores/{id}": {
        get: {
          summary: "Consulta autor e livros relacionados",
        },
        put: {
          summary: "Atualiza autor",
        },
        delete: {
          summary: "Remove autor respeitando integridade",
        },
      },

      "/emprestimos": {
        get: {
          summary: "Lista empréstimos com filtros, paginação e ordenação",
        },
        post: {
          summary: "Cria empréstimo em transação",
        },
      },

      "/emprestimos/{id}": {
        get: {
          summary: "Consulta empréstimo",
        },
        put: {
          summary: "Atualiza empréstimo",
        },
        delete: {
          summary: "Exclui empréstimo devolvido",
        },
      },

      "/emprestimos/{id}/devolver": {
        put: {
          summary: "Registra devolução em transação",
        },
      },
    },
  });
});

app.use("/livros", livrosRoutes);
app.use("/estudantes", estudantesRoutes);
app.use("/autores", autoresRoutes);
app.use("/emprestimos", emprestimosRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
