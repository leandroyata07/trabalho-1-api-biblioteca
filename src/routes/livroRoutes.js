import { Router } from "express";
import {
  listarLivros, obterLivro, criarLivro, atualizarLivro, excluirLivro
} from "../controllers/livroController.js";

const router = Router();
router.get("/", listarLivros);
router.get("/:id", obterLivro);
router.post("/", criarLivro);
router.put("/:id", atualizarLivro);
router.delete("/:id", excluirLivro);
export default router;
