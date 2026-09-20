import { Router } from "express";
import {
  listarEmprestimos, obterEmprestimo, criarEmprestimo,
  atualizarEmprestimo, excluirEmprestimo, devolverEmprestimo
} from "../controllers/emprestimoController.js";

const router = Router();
router.get("/", listarEmprestimos);
router.get("/:id", obterEmprestimo);
router.post("/", criarEmprestimo);
router.put("/:id", atualizarEmprestimo);
router.delete("/:id", excluirEmprestimo);
router.put("/:id/devolver", devolverEmprestimo);
export default router;
