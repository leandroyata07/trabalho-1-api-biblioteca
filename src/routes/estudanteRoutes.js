import { Router } from "express";
import {
  listarEstudantes, obterEstudante, criarEstudante,
  atualizarEstudante, excluirEstudante
} from "../controllers/estudanteController.js";

const router = Router();
router.get("/", listarEstudantes);
router.get("/:id", obterEstudante);
router.post("/", criarEstudante);
router.put("/:id", atualizarEstudante);
router.delete("/:id", excluirEstudante);
export default router;
