/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_user_id` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupCategory" AS ENUM ('ACADEMIC', 'HOSTEL', 'CLUB', 'HOBBY', 'EVENT');

-- CreateEnum
CREATE TYPE "GroupVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "GroupRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_EDIT');

-- CreateEnum
CREATE TYPE "GroupMemberStatus" AS ENUM ('ACTIVE', 'PENDING', 'BANNED');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ItemAvailabilityStatus" AS ENUM ('AVAILABLE', 'ON_LOAN', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProofFileType" AS ENUM ('APPROVAL_LETTER', 'POSTER', 'WEBSITE_SCREENSHOT', 'OTHER');

-- AlterTable
ALTER TABLE "group_members" ADD COLUMN     "status" "GroupMemberStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "category" "GroupCategory" NOT NULL,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "item_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "member_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "owner_user_id" UUID NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" "GroupVisibility" NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE "group_requests" (
    "id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "group_name" TEXT NOT NULL,
    "category" "GroupCategory" NOT NULL,
    "faculty_email" TEXT,
    "official_email" TEXT,
    "short_description" TEXT,
    "status" "GroupRequestStatus" NOT NULL DEFAULT 'PENDING',
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_proofs" (
    "id" UUID NOT NULL,
    "group_request_id" UUID NOT NULL,
    "uploader_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" "ProofFileType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_join_requests" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "message" TEXT,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_items" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ItemCategory" NOT NULL,
    "condition" TEXT,
    "availability_status" "ItemAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "image_urls" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_bookings" (
    "id" UUID NOT NULL,
    "group_item_id" UUID NOT NULL,
    "booked_by_user_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_action_logs" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action_type" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" UUID,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_requests_requester_id_idx" ON "group_requests"("requester_id");

-- CreateIndex
CREATE INDEX "group_requests_status_idx" ON "group_requests"("status");

-- CreateIndex
CREATE INDEX "group_proofs_group_request_id_idx" ON "group_proofs"("group_request_id");

-- CreateIndex
CREATE INDEX "group_join_requests_group_id_idx" ON "group_join_requests"("group_id");

-- CreateIndex
CREATE INDEX "group_join_requests_user_id_idx" ON "group_join_requests"("user_id");

-- CreateIndex
CREATE INDEX "group_join_requests_status_idx" ON "group_join_requests"("status");

-- CreateIndex
CREATE INDEX "group_items_group_id_idx" ON "group_items"("group_id");

-- CreateIndex
CREATE INDEX "group_items_availability_status_idx" ON "group_items"("availability_status");

-- CreateIndex
CREATE INDEX "group_bookings_group_item_id_idx" ON "group_bookings"("group_item_id");

-- CreateIndex
CREATE INDEX "group_bookings_booked_by_user_id_idx" ON "group_bookings"("booked_by_user_id");

-- CreateIndex
CREATE INDEX "group_bookings_status_idx" ON "group_bookings"("status");

-- CreateIndex
CREATE INDEX "group_bookings_start_date_end_date_idx" ON "group_bookings"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "group_action_logs_group_id_idx" ON "group_action_logs"("group_id");

-- CreateIndex
CREATE INDEX "group_action_logs_actor_id_idx" ON "group_action_logs"("actor_id");

-- CreateIndex
CREATE INDEX "group_action_logs_created_at_idx" ON "group_action_logs"("created_at");

-- CreateIndex
CREATE INDEX "group_members_status_idx" ON "group_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "groups_slug_key" ON "groups"("slug");

-- CreateIndex
CREATE INDEX "groups_category_idx" ON "groups"("category");

-- CreateIndex
CREATE INDEX "groups_is_verified_idx" ON "groups"("is_verified");

-- CreateIndex
CREATE INDEX "groups_owner_user_id_idx" ON "groups"("owner_user_id");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_requests" ADD CONSTRAINT "group_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_proofs" ADD CONSTRAINT "group_proofs_group_request_id_fkey" FOREIGN KEY ("group_request_id") REFERENCES "group_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_join_requests" ADD CONSTRAINT "group_join_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_items" ADD CONSTRAINT "group_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_bookings" ADD CONSTRAINT "group_bookings_group_item_id_fkey" FOREIGN KEY ("group_item_id") REFERENCES "group_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_action_logs" ADD CONSTRAINT "group_action_logs_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
