import { livroRepository } from "../repositories/livroRepository.js";
import { estudanteRepository } from "../repositories/estudanteRepository.js";
import { autorRepository } from "../repositories/autorRepository.js";
import { emprestimoRepository } from "../repositories/emprestimoRepository.js";
import { notificacaoRepository } from "../repositories/notificacaoRepository.js";
import { LivroService } from "../services/LivroService.js";
import { EstudanteService } from "../services/EstudanteService.js";
import { AutorService } from "../services/AutorService.js";
import { EmprestimoService } from "../services/EmprestimoService.js";
import { NotificacaoService } from "../services/NotificacaoService.js";
import { criarLivroController } from "../controllers/livroController.js";
import { criarEstudanteController } from "../controllers/estudanteController.js";
import { criarAutorController } from "../controllers/autorController.js";
import { criarEmprestimoController } from "../controllers/emprestimoController.js";
import { criarNotificacaoController } from "../controllers/notificacaoController.js";
import { eventBus } from "../application/eventBus.js";

const livroService = new LivroService(livroRepository, autorRepository);
const estudanteService = new EstudanteService(estudanteRepository);
const autorService = new AutorService(autorRepository);
export const notificacaoService = new NotificacaoService(notificacaoRepository, eventBus);
const emprestimoService = new EmprestimoService(emprestimoRepository, notificacaoService, eventBus);

export const livroController = criarLivroController(livroService);
export const estudanteController = criarEstudanteController(estudanteService);
export const autorController = criarAutorController(autorService);
export const emprestimoController = criarEmprestimoController(emprestimoService);
export const notificacaoController = criarNotificacaoController(notificacaoService);
