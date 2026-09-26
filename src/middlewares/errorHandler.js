/* eslint-disable no-unused-vars */
/* global console */

export function errorHandler(error, req, res, next) {
  console.error(`[${req.method} ${req.originalUrl}]`, error?.message || error);

  if (error?.status) {
    return res.status(error.status).json({ erro: error.message });
  }

  switch (error?.code) {
    case "P2002":
      return res.status(409).json({ erro: "Registro duplicado: um valor UNIQUE já está cadastrado" });
    case "P2003":
      return res.status(409).json({ erro: "Não é possível realizar a operação porque existem registros relacionados" });
    case "P2025":
      return res.status(404).json({ erro: "Registro não encontrado" });
    default:
      return res.status(500).json({ erro: "Erro interno ao processar a operação" });
  }
}