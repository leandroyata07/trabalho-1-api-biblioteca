import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { eventBus } from "./application/eventBus.js";
import { notificacaoService } from "./config/container.js";
import { setupSocketServer } from "./adapters/websocket/socketIoServer.js";

const port = Number(process.env.PORT) || 3001;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  serveClient: true,
  connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true },
});
const removeSocketSubscriptions = setupSocketServer(io, { prisma, notificacaoService, eventBus });

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Recebido ${signal}; encerrando HTTP, Socket.IO e banco...`);
  const forceExit = setTimeout(() => process.exit(1), 10000);
  forceExit.unref();
  removeSocketSubscriptions();
  io.close(async () => {
    try { await prisma.$disconnect(); process.exit(0); }
    catch (error) { console.error("Erro ao encerrar banco:", error); process.exit(1); }
  });
}

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(port, "0.0.0.0", () => console.log(`Biblioteca em Tempo Real disponível em http://localhost:${port}`));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export { httpServer, io };
