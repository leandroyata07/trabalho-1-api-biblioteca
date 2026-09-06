# Trabalho 1 - API de Biblioteca

**UFRB - Universidade Federal do Recôncavo da Bahia - Polo Feira de Santana - BA**  
**Curso:** Licenciatura em Computação — 4ª Semestre  
**Disciplina:** Desenvolvimento de Software II  
**Docente:** Tassio Valle  
**Equipe/Discente:** Leandro Oliveira Lima  

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
# Trabalho 1 - API de Biblioteca

API REST desenvolvida em Node.js e Express para gerenciar o dominio de uma biblioteca. O sistema permite cadastrar livros e estudantes, controlar emprestimos, impedir o emprestimo de livros indisponiveis e registrar devolucoes.

## Instalacao

Requisitos: Node.js 18 ou superior e npm.

Na pasta do projeto, execute:

```bash
npm install
```

## Execucao

Para iniciar o servidor:

```bash
npm start
```

A API sera disponibilizada em `http://localhost:3001`.

Para validar a sintaxe do projeto:

```bash
npm test
```

## Endpoints

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/` | Apresenta a API e seus recursos |
| GET | `/docs` | Exibe a documentacao resumida |
| GET | `/openapi.json` | Retorna a especificacao OpenAPI |
| GET | `/livros` | Lista livros, com filtros e paginacao |
| GET | `/livros/:id` | Consulta um livro |
| POST | `/livros` | Cadastra um livro |
| PUT | `/livros/:id` | Atualiza um livro |
| DELETE | `/livros/:id` | Remove um livro |
| GET | `/estudantes` | Lista estudantes, com filtro e paginacao |
| GET | `/estudantes/:id` | Consulta um estudante |
| POST | `/estudantes` | Cadastra um estudante |
| PUT | `/estudantes/:id` | Atualiza um estudante |
| DELETE | `/estudantes/:id` | Remove um estudante |
| GET | `/emprestimos` | Lista emprestimos |
| GET | `/emprestimos/:id` | Consulta um emprestimo |
| POST | `/emprestimos` | Cria um emprestimo |
| PUT | `/emprestimos/:id/devolver` | Registra a devolucao de um livro |

As listagens aceitam `?pagina=1&limite=10`. Os livros aceitam os filtros `?titulo=dom` e `?autor=machado`. Os estudantes aceitam o filtro `?nome=ana`.

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
