CREATE TABLE "Estudante" (
  "id" SERIAL NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Estudante_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Livro" (
  "id" SERIAL NOT NULL,
  "titulo" TEXT NOT NULL,
  "isbn" TEXT NOT NULL,
  "disponivel" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Livro_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Autor" (
  "id" SERIAL NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Autor_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LivroAutor" (
  "livroId" INTEGER NOT NULL,
  "autorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LivroAutor_pkey" PRIMARY KEY ("livroId", "autorId")
);
CREATE TABLE "Emprestimo" (
  "id" SERIAL NOT NULL,
  "livroId" INTEGER NOT NULL,
  "estudanteId" INTEGER NOT NULL,
  "dataEmprestimo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataDevolucao" TIMESTAMP(3),
  "devolvido" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Emprestimo_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notificacao" (
  "id" SERIAL NOT NULL,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensagem" TEXT NOT NULL,
  "lida" BOOLEAN NOT NULL DEFAULT false,
  "emprestimoId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Estudante_email_key" ON "Estudante"("email");
CREATE INDEX "Estudante_nome_idx" ON "Estudante"("nome");
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
CREATE INDEX "Livro_titulo_idx" ON "Livro"("titulo");
CREATE INDEX "Livro_disponivel_idx" ON "Livro"("disponivel");
CREATE UNIQUE INDEX "Autor_email_key" ON "Autor"("email");
CREATE INDEX "Autor_nome_idx" ON "Autor"("nome");
CREATE INDEX "LivroAutor_autorId_idx" ON "LivroAutor"("autorId");
CREATE INDEX "Emprestimo_livroId_idx" ON "Emprestimo"("livroId");
CREATE INDEX "Emprestimo_estudanteId_idx" ON "Emprestimo"("estudanteId");
CREATE INDEX "Emprestimo_devolvido_idx" ON "Emprestimo"("devolvido");
CREATE INDEX "Notificacao_lida_idx" ON "Notificacao"("lida");
CREATE INDEX "Notificacao_tipo_idx" ON "Notificacao"("tipo");
CREATE INDEX "Notificacao_createdAt_idx" ON "Notificacao"("createdAt");
ALTER TABLE "LivroAutor" ADD CONSTRAINT "LivroAutor_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LivroAutor" ADD CONSTRAINT "LivroAutor_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Emprestimo" ADD CONSTRAINT "Emprestimo_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Emprestimo" ADD CONSTRAINT "Emprestimo_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_emprestimoId_fkey" FOREIGN KEY ("emprestimoId") REFERENCES "Emprestimo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
