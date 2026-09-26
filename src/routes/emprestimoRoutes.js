import { Router } from "express";
import { emprestimoController } from "../config/container.js";

const router = Router();

router.get("/", emprestimoController.listar);

router.get("/:id", emprestimoController.obter);

router.post("/", emprestimoController.criar);

router.put("/:id", emprestimoController.atualizar);

router.delete("/:id", emprestimoController.excluir);

router.put("/:id/devolver", emprestimoController.devolver);

export default router;