import { Router } from "express";
import {
  listarAutores, obterAutor, criarAutor, atualizarAutor, excluirAutor
} from "../controllers/autorController.js";

const router = Router();
router.get("/", listarAutores);
router.get("/:id", obterAutor);
router.post("/", criarAutor);
router.put("/:id", atualizarAutor);
router.delete("/:id", excluirAutor);
export default router;
