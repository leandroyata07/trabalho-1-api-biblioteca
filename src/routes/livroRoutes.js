import { Router } from "express";
import { livroController } from "../config/container.js";

const router = Router();

router.get("/", livroController.listar);
router.get("/:id", livroController.obter);
router.post("/", livroController.criar);
router.put("/:id", livroController.atualizar);
router.delete("/:id", livroController.excluir);

export default router;