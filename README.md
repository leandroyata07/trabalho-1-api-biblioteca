# Trabalho 1 - API de Biblioteca

API REST desenvolvida em Node.js com Express para controlar livros, estudantes e emprestimos.
Na pasta `Trabalho 1`, execute:

```bash
npm install
npm start
```

O servidor sera iniciado em `http://localhost:3001`.

## Recursos

- `livros`: cadastro, consulta, alteracao, exclusao, filtro por titulo/autor e paginacao.
- `estudantes`: cadastro, consulta, alteracao, exclusao, filtro por nome e paginacao.
- `emprestimos`: relaciona um livro a um estudante, impede emprestimo de livro indisponivel e permite devolucao.

## Rotas principais

| Metodo | Rota | Funcao |
| --- | --- | --- |
## Publicacao no GitHub

Na pasta do projeto, execute:

```bash
git init
git add .
git commit -m "Entrega do Trabalho 1"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/trabalho-1-api-biblioteca.git
git push -u origin main
```

Antes do `git push`, crie no GitHub um repositorio publico com o nome `trabalho-1-api-biblioteca` e substitua `SEU-USUARIO` pelo seu usuario.
| GET | `/` | Apresenta a API |
| GET | `/docs` | Documentacao resumida |
| GET | `/livros` | Lista livros |
| POST | `/livros` | Cadastra livro |
| PUT | `/livros/:id` | Atualiza livro |
| DELETE | `/livros/:id` | Remove livro |
| GET | `/estudantes` | Lista estudantes |
| POST | `/estudantes` | Cadastra estudante |
| PUT | `/estudantes/:id` | Atualiza estudante |
| DELETE | `/estudantes/:id` | Remove estudante |
| GET | `/emprestimos` | Lista emprestimos |
| POST | `/emprestimos` | Cria emprestimo |
| PUT | `/emprestimos/:id/devolver` | Registra devolucao |

As listagens aceitam `?pagina=1&limite=10`. Exemplos de filtros: `/livros?titulo=dom` e `/livros?autor=machado`.

## Exemplos de requisicao

Cadastrar livro:

```json
{
  "titulo": "Capitaes da Areia",
  "autor": "Jorge Amado"
}
```

Cadastrar estudante:

```json
{
  "nome": "Carla Santos",
  "email": "carla@example.com"
}
```

Criar emprestimo:

```json
{
  "livroId": 1,
  "estudanteId": 1
}
```