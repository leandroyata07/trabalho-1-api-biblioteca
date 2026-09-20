-- CreateTable
CREATE TABLE "Autor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LivroAutor" (
    "livroId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LivroAutor_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LivroAutor_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY ("livroId", "autorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Autor_email_key" ON "Autor"("email");
CREATE INDEX "Autor_nome_idx" ON "Autor"("nome");
CREATE INDEX "LivroAutor_autorId_idx" ON "LivroAutor"("autorId");
