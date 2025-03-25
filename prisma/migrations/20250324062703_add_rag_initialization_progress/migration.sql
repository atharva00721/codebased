-- CreateTable
CREATE TABLE "RagInitializationProgress" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RagInitializationProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RagInitializationProgress_status_idx" ON "RagInitializationProgress"("status");

-- CreateIndex
CREATE INDEX "RagInitializationProgress_userId_idx" ON "RagInitializationProgress"("userId");

-- CreateIndex
CREATE INDEX "RagInitializationProgress_projectId_idx" ON "RagInitializationProgress"("projectId");

-- AddForeignKey
ALTER TABLE "RagInitializationProgress" ADD CONSTRAINT "RagInitializationProgress_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
