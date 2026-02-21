-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'WARNED', 'TEMP_BANNED', 'PERMA_BANNED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EntityType" ADD VALUE 'GROUP';
ALTER TYPE "EntityType" ADD VALUE 'CHAT';

-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'DISMISSED';

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "banned_until" TIMESTAMP(3),
ADD COLUMN     "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "groups_status_idx" ON "groups"("status");
