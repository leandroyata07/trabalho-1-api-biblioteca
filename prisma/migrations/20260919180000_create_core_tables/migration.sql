-- CreateTable
CREATE TABLE "Estudante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Livro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Emprestimo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "livroId" INTEGER NOT NULL,
    "estudanteId" INTEGER NOT NULL,
    "dataEmprestimo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" DATETIME,
    "devolvido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Emprestimo_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emprestimo_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudante_email_key" ON "Estudante"("email");
CREATE INDEX "Estudante_nome_idx" ON "Estudante"("nome");

CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
CREATE INDEX "Livro_titulo_idx" ON "Livro"("titulo");
CREATE INDEX "Livro_disponivel_idx" ON "Livro"("disponivel");

CREATE INDEX "Emprestimo_livroId_idx" ON "Emprestimo"("livroId");
CREATE INDEX "Emprestimo_estudanteId_idx" ON "Emprestimo"("estudanteId");
CREATE INDEX "Emprestimo_devolvido_idx" ON "Emprestimo"("devolvido");
