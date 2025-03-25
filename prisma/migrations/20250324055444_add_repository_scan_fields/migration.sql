-- AlterTable
ALTER TABLE "RepositoryProcessingState" ADD COLUMN     "lastScannedAt" TIMESTAMP(3),
ADD COLUMN     "pendingFiles" TEXT[],
ADD COLUMN     "scanComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scannedPaths" TEXT[];
