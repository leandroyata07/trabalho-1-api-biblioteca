import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root: here,
  plugins: [react()],
  build: { outDir: path.resolve(here, "dist"), emptyOutDir: true, sourcemap: false },
  server: { port: 5173, proxy: { "/livros": "http://localhost:3001", "/estudantes": "http://localhost:3001", "/autores": "http://localhost:3001", "/emprestimos": "http://localhost:3001", "/notificacoes": "http://localhost:3001", "/socket.io": { target: "http://localhost:3001", ws: true }, "/health": "http://localhost:3001" } },
});
