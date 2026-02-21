/*
  Warnings:

  - You are about to drop the column `request_id` on the `conversations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_a_id,user_b_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_a_id` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_b_id` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST', 'MESSAGE', 'SYSTEM', 'KARMA');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'LOCKED');

-- AlterEnum
ALTER TYPE "ItemCategory" ADD VALUE 'Class';

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_request_id_fkey";

-- DropIndex
DROP INDEX "conversations_request_id_key";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "request_id",
ADD COLUMN     "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "user_a_id" UUID NOT NULL,
ADD COLUMN     "user_b_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "conversation_id" UUID,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_user_a_id_user_b_id_key" ON "conversations"("user_a_id", "user_b_id");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
