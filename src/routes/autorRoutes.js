import { Router } from "express";
import { autorController } from "../config/container.js";

const router = Router();

router.get("/", autorController.listar);
router.get("/:id", autorController.obter);
router.post("/", autorController.criar);
router.put("/:id", autorController.atualizar);
router.delete("/:id", autorController.excluir);

export default router;