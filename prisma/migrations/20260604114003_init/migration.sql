-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerCallId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "transcript" TEXT,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Call_providerCallId_key" ON "Call"("providerCallId");
