/*
  Warnings:

  - You are about to drop the `sourceCodeEmbedding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sourceCodeEmbedding" DROP CONSTRAINT "sourceCodeEmbedding_projectId_fkey";

-- DropTable
DROP TABLE "sourceCodeEmbedding";
