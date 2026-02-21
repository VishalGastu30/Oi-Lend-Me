-- AlterTable
ALTER TABLE "items" ADD COLUMN     "condition" TEXT,
ADD COLUMN     "deposit" DECIMAL(10,2),
ADD COLUMN     "lender_note" TEXT,
ADD COLUMN     "max_lending_days" INTEGER;
