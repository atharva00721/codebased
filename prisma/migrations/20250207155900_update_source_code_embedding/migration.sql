/*
  Warnings:

  - You are about to drop the `CodeEmbedding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `source_code_embeddings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodeEmbedding" DROP CONSTRAINT "CodeEmbedding_projectId_fkey";

-- DropForeignKey
ALTER TABLE "source_code_embeddings" DROP CONSTRAINT "source_code_embeddings_projectId_fkey";

-- DropTable
DROP TABLE "CodeEmbedding";

-- DropTable
DROP TABLE "source_code_embeddings";

-- CreateTable
CREATE TABLE "sourceCodeEmbedding" (
    "id" TEXT NOT NULL,
    "summaryEmbedding" vector(768),
    "sourceCode" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "sourceCodeEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sourceCodeEmbedding" ADD CONSTRAINT "sourceCodeEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
