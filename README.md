# Trabalho 3 – Refatoração Arquitetural e Padrões de Projeto

## UFRB – Universidade Federal do Recôncavo da Bahia

**Polo:** Feira de Santana – BA  
**Curso:** Licenciatura em Computação – 4ª Semestre  
**Disciplina:** Desenvolvimento de Software II  
**Docente:** Tassio Valle  
**Discente:** Leandro Oliveira Lima

---

# 1. Sobre o projeto

Este projeto corresponde ao Trabalho 3 da disciplina de Desenvolvimento de Software II.

A aplicação consiste em uma API REST de biblioteca, desenvolvida originalmente nos trabalhos anteriores e posteriormente refatorada para adoção de uma arquitetura em camadas e padrões de projeto.

A refatoração teve como objetivo melhorar a organização interna da aplicação, separar responsabilidades e reduzir o acoplamento entre os componentes, mantendo o comportamento externo da API.

A aplicação utiliza:

- Node.js;
- Express;
- Prisma ORM;
- SQLite;
- JavaScript com ES Modules;
- ESLint.

---

# 2. Objetivos da refatoração

A refatoração buscou:

- separar as responsabilidades da aplicação;
- organizar o projeto em camadas;
- retirar regras de negócio dos Controllers;
- isolar o acesso ao banco de dados;
- utilizar Dependency Injection;
- aplicar padrões de projeto de forma justificada;
- facilitar manutenção e testes;
- preservar os endpoints existentes;
- manter o contrato da API desenvolvido no Trabalho 2.

---

# 3. Arquitetura

A aplicação foi organizada nas seguintes camadas:

```text
Cliente
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
Prisma ORM
   │
   ▼
SQLite