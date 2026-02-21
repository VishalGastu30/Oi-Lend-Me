-- CreateEnum
CREATE TYPE "RequirementUrgency" AS ENUM ('NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "RequirementVisibility" AS ENUM ('CAMPUS', 'GROUP');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('OPEN', 'FULFILLED', 'CLOSED', 'EXPIRED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "about" TEXT,
ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "requirements" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ItemCategory" NOT NULL,
    "duration_start" TIMESTAMP(3) NOT NULL,
    "duration_end" TIMESTAMP(3) NOT NULL,
    "urgency" "RequirementUrgency" NOT NULL DEFAULT 'NORMAL',
    "visibility" "RequirementVisibility" NOT NULL DEFAULT 'CAMPUS',
    "status" "RequirementStatus" NOT NULL DEFAULT 'OPEN',
    "requester_id" UUID NOT NULL,
    "group_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_responses" (
    "id" UUID NOT NULL,
    "requirement_id" UUID NOT NULL,
    "lender_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "borrow_request_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirement_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requirements_requester_id_idx" ON "requirements"("requester_id");

-- CreateIndex
CREATE INDEX "requirements_status_idx" ON "requirements"("status");

-- CreateIndex
CREATE INDEX "requirements_category_idx" ON "requirements"("category");

-- CreateIndex
CREATE INDEX "requirements_visibility_idx" ON "requirements"("visibility");

-- CreateIndex
CREATE INDEX "requirements_expires_at_idx" ON "requirements"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_responses_borrow_request_id_key" ON "requirement_responses"("borrow_request_id");

-- CreateIndex
CREATE INDEX "requirement_responses_requirement_id_idx" ON "requirement_responses"("requirement_id");

-- CreateIndex
CREATE INDEX "requirement_responses_lender_id_idx" ON "requirement_responses"("lender_id");

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_responses" ADD CONSTRAINT "requirement_responses_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_responses" ADD CONSTRAINT "requirement_responses_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_responses" ADD CONSTRAINT "requirement_responses_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_responses" ADD CONSTRAINT "requirement_responses_borrow_request_id_fkey" FOREIGN KEY ("borrow_request_id") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
