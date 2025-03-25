/*
  Warnings:

  - You are about to drop the `RagInitializationProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RagInitializationProgress" DROP CONSTRAINT "RagInitializationProgress_projectId_fkey";

-- DropTable
DROP TABLE "RagInitializationProgress";
