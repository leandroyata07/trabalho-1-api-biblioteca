const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

let livros = [
  { id: 1, titulo: 'O Pequeno Principe', autor: 'Antoine de Saint-Exupery', disponivel: true },
  { id: 2, titulo: 'Dom Casmurro', autor: 'Machado de Assis', disponivel: true }
];

let estudantes = [
  { id: 1, nome: 'Ana Souza', email: 'ana@example.com' },
  { id: 2, nome: 'Bruno Lima', email: 'bruno@example.com' }
];

let emprestimos = [];
let proximosIds = { livros: 3, estudantes: 3, emprestimos: 1 };

function buscarPorId(lista, id) {
  return lista.find(item => item.id === id);
}

function paginar(lista, req) {
  const pagina = Math.max(Number.parseInt(req.query.pagina, 10) || 1, 1);
  const limite = Math.min(Math.max(Number.parseInt(req.query.limite, 10) || 10, 1), 50);
  const inicio = (pagina - 1) * limite;

  return {
    dados: lista.slice(inicio, inicio + limite),
    pagina,
    limite,
    total: lista.length,
    totalPaginas: Math.ceil(lista.length / limite)
  };
}

function validarCampos(body, campos) {
  return campos.every(campo => body[campo] !== undefined && body[campo] !== '');
}

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Biblioteca funcionando',
    recursos: ['/livros', '/estudantes', '/emprestimos'],
    documentacao: '/docs'
  });
});

app.get('/docs', (req, res) => {
  res.type('html').send(`
    <h1>API Biblioteca</h1>
    <p>Recursos disponíveis:</p>
    <ul>
      <li>GET, POST, PUT e DELETE /livros</li>
      <li>GET, POST, PUT e DELETE /estudantes</li>
      <li>GET, POST e PUT /emprestimos</li>
    </ul>
    <p>Listagens aceitam <code>?pagina=1&limite=10</code>. Livros aceitam <code>?titulo=dom</code> e <code>?autor=machado</code>.</p>
  `);
});

app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'API Biblioteca', version: '1.0.0' },
    paths: {
      '/livros': { get: { summary: 'Lista livros' }, post: { summary: 'Cadastra livro' } },
      '/estudantes': { get: { summary: 'Lista estudantes' }, post: { summary: 'Cadastra estudante' } },
      '/emprestimos': { get: { summary: 'Lista emprestimos' }, post: { summary: 'Cria emprestimo' } },
      '/emprestimos/{id}/devolver': { put: { summary: 'Registra devolucao' } }
    }
  });
});

app.get('/livros', (req, res) => {
  const titulo = String(req.query.titulo || '').toLowerCase();
  const autor = String(req.query.autor || '').toLowerCase();
  const filtrados = livros.filter(livro =>
    livro.titulo.toLowerCase().includes(titulo) && livro.autor.toLowerCase().includes(autor)
  );
  res.json(paginar(filtrados, req));
});

app.get('/livros/:id', (req, res) => {
  const livro = buscarPorId(livros, Number.parseInt(req.params.id, 10));
  if (!livro) return res.status(404).json({ erro: 'Livro nao encontrado' });
  res.json(livro);
});

app.post('/livros', (req, res) => {
  if (!validarCampos(req.body, ['titulo', 'autor'])) {
    return res.status(400).json({ erro: 'Os campos titulo e autor sao obrigatorios' });
  }

  const livro = {
    id: proximosIds.livros++,
    titulo: req.body.titulo,
    autor: req.body.autor,
    disponivel: true
  };
  livros.push(livro);
  res.status(201).json(livro);
});

app.put('/livros/:id', (req, res) => {
  const livro = buscarPorId(livros, Number.parseInt(req.params.id, 10));
  if (!livro) return res.status(404).json({ erro: 'Livro nao encontrado' });
  if (req.body.titulo !== undefined) livro.titulo = req.body.titulo;
  if (req.body.autor !== undefined) livro.autor = req.body.autor;
  res.json(livro);
});

app.delete('/livros/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const indice = livros.findIndex(livro => livro.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Livro nao encontrado' });
  if (emprestimos.some(emprestimo => emprestimo.livroId === id && !emprestimo.devolvido)) {
    return res.status(409).json({ erro: 'Livro possui emprestimo ativo' });
  }
  livros.splice(indice, 1);
  res.json({ mensagem: 'Livro removido com sucesso' });
});

app.get('/estudantes', (req, res) => {
  const nome = String(req.query.nome || '').toLowerCase();
  const filtrados = estudantes.filter(estudante => estudante.nome.toLowerCase().includes(nome));
  res.json(paginar(filtrados, req));
});

app.get('/estudantes/:id', (req, res) => {
  const estudante = buscarPorId(estudantes, Number.parseInt(req.params.id, 10));
  if (!estudante) return res.status(404).json({ erro: 'Estudante nao encontrado' });
  res.json(estudante);
});

app.post('/estudantes', (req, res) => {
  if (!validarCampos(req.body, ['nome', 'email'])) {
    return res.status(400).json({ erro: 'Os campos nome e email sao obrigatorios' });
  }
  if (estudantes.some(estudante => estudante.email === req.body.email)) {
    return res.status(409).json({ erro: 'Email ja cadastrado' });
  }

  const estudante = { id: proximosIds.estudantes++, nome: req.body.nome, email: req.body.email };
  estudantes.push(estudante);
  res.status(201).json(estudante);
});

app.put('/estudantes/:id', (req, res) => {
  const estudante = buscarPorId(estudantes, Number.parseInt(req.params.id, 10));
  if (!estudante) return res.status(404).json({ erro: 'Estudante nao encontrado' });
  if (req.body.nome !== undefined) estudante.nome = req.body.nome;
  if (req.body.email !== undefined) estudante.email = req.body.email;
  res.json(estudante);
});

app.delete('/estudantes/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const indice = estudantes.findIndex(estudante => estudante.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Estudante nao encontrado' });
  if (emprestimos.some(emprestimo => emprestimo.estudanteId === id && !emprestimo.devolvido)) {
    return res.status(409).json({ erro: 'Estudante possui emprestimo ativo' });
  }
  estudantes.splice(indice, 1);
  res.json({ mensagem: 'Estudante removido com sucesso' });
});

app.get('/emprestimos', (req, res) => {
  res.json(paginar(emprestimos, req));
});

app.get('/emprestimos/:id', (req, res) => {
  const emprestimo = buscarPorId(emprestimos, Number.parseInt(req.params.id, 10));
  if (!emprestimo) return res.status(404).json({ erro: 'Emprestimo nao encontrado' });
  res.json(emprestimo);
});

app.post('/emprestimos', (req, res) => {
  const livroId = Number.parseInt(req.body.livroId, 10);
  const estudanteId = Number.parseInt(req.body.estudanteId, 10);
  const livro = buscarPorId(livros, livroId);
  const estudante = buscarPorId(estudantes, estudanteId);

  if (!livroId || !estudanteId) {
    return res.status(400).json({ erro: 'livroId e estudanteId sao obrigatorios' });
  }
  if (!livro || !estudante) return res.status(404).json({ erro: 'Livro ou estudante nao encontrado' });
  if (!livro.disponivel) return res.status(409).json({ erro: 'Livro nao esta disponivel' });

  const emprestimo = {
    id: proximosIds.emprestimos++,
    livroId,
    estudanteId,
    dataEmprestimo: new Date().toISOString().slice(0, 10),
    devolvido: false
  };
  emprestimos.push(emprestimo);
  livro.disponivel = false;
  res.status(201).json(emprestimo);
});

app.put('/emprestimos/:id/devolver', (req, res) => {
  const emprestimo = buscarPorId(emprestimos, Number.parseInt(req.params.id, 10));
  if (!emprestimo) return res.status(404).json({ erro: 'Emprestimo nao encontrado' });
  if (emprestimo.devolvido) return res.status(409).json({ erro: 'Emprestimo ja devolvido' });

  emprestimo.devolvido = true;
  emprestimo.dataDevolucao = new Date().toISOString().slice(0, 10);
  const livro = buscarPorId(livros, emprestimo.livroId);
  if (livro) livro.disponivel = true;
  res.json(emprestimo);
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada' });
});

if (require.main === module) {
  app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
}

module.exports = app;
