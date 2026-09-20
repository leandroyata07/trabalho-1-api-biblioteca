export function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function mapLivro(livro) {
  if (!livro) return livro;
  return {
    ...livro,
    autor: livro.autores?.map((item) => item.autor.nome).join(", ") || null,
    autores: livro.autores?.map((item) => item.autor) || [],
  };
}
