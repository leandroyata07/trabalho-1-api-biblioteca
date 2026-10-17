import { Router } from "express";
import { notificacaoController } from "../config/container.js";

const router = Router();
router.get("/nao-lidas/total", notificacaoController.naoLidas);
router.put("/lidas", notificacaoController.marcarTodasComoLidas);
router.get("/", notificacaoController.listar);
router.put("/:id/lida", notificacaoController.marcarComoLida);
router.delete("/:id", notificacaoController.excluir);
export default router;
