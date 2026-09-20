export function getPagination(req) {
  const pagina = Math.max(Number.parseInt(req.query.pagina, 10) || 1, 1);
  const limite = Math.min(
    Math.max(Number.parseInt(req.query.limite, 10) || 10, 1),
    50
  );
  return {
    pagina,
    limite,
    skip: (pagina - 1) * limite,
    take: limite,
  };
}

export function buildPage(dados, total, pagina, limite) {
  return {
    dados,
    pagina,
    limite,
    total,
    totalPaginas: Math.ceil(total / limite),
  };
}

export function getDirection(value) {
  return String(value || "asc").toLowerCase() === "desc" ? "desc" : "asc";
}
