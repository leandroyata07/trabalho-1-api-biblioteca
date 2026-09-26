# ADR 001 — Separação em Camadas

## Contexto

A API de Biblioteca cresceu durante os trabalhos anteriores e passou a possuir diferentes responsabilidades relacionadas à comunicação HTTP, regras da aplicação e persistência dos dados.

Manter essas responsabilidades misturadas dificultaria a manutenção e a evolução do sistema.

## Decisão

Adotar uma arquitetura em camadas, separando:

- Routes;
- Controllers;
- Services;
- Repositories;
- Middlewares.

Cada camada possui uma responsabilidade específica.

O Controller realiza a comunicação com HTTP, o Service concentra os casos de uso e regras da aplicação, e o Repository concentra o acesso aos dados.

## Consequências

A aplicação passa a possuir responsabilidades mais bem delimitadas e menor acoplamento entre as partes.

Como consequência, existe uma quantidade maior de arquivos e chamadas entre camadas, porém a estrutura fica mais organizada e facilita futuras alterações.