import "dotenv/config";
import express from "express";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { prisma } from "./lib/prisma.js";
import livrosRoutes from "./routes/livroRoutes.js";
import estudantesRoutes from "./routes/estudanteRoutes.js";
import autoresRoutes from "./routes/autorRoutes.js";
import emprestimosRoutes from "./routes/emprestimoRoutes.js";
import notificacoesRoutes from "./routes/notificacaoRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, "../frontend/dist");
const openapi = YAML.parse(readFileSync(path.resolve(__dirname, "docs/openapi.yaml"), "utf8"));
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    return res.status(503).json({ status: "degraded", database: "unavailable" });
  }
});
app.get("/", (_req, res) => res.sendFile(path.join(frontendDist, "index.html")));
app.get("/openapi.json", (_req, res) => res.json(openapi));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true, customSiteTitle: "Documentação — Biblioteca em Tempo Real" }));

// Resources from Trabalho 3 remain available at their original paths.
app.use("/livros", livrosRoutes);
app.use("/estudantes", estudantesRoutes);
app.use("/autores", autoresRoutes);
app.use("/emprestimos", emprestimosRoutes);
app.use("/notificacoes", notificacoesRoutes);

// Built front-end assets are served by this same HTTP server and port.
app.use(express.static(frontendDist, { index: false, maxAge: "1h" }));
app.use(notFound);
app.use(errorHandler);
export default app;
