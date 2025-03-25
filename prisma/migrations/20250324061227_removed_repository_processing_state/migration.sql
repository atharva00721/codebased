/*
  Warnings:

  - You are about to drop the `RepositoryProcessingState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RepositoryProcessingState" DROP CONSTRAINT "RepositoryProcessingState_projectId_fkey";

-- DropTable
DROP TABLE "RepositoryProcessingState";
