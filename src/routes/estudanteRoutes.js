import { Router } from "express";
import { estudanteController } from "../config/container.js";

const router = Router();

router.get("/", estudanteController.listar);
router.get("/:id", estudanteController.obter);
router.post("/", estudanteController.criar);
router.put("/:id", estudanteController.atualizar);
router.delete("/:id", estudanteController.excluir);

export default router;