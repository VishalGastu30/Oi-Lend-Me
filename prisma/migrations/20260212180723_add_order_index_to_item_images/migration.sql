/*
  Warnings:

  - Added the required column `order_index` to the `item_images` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column with temporary default value of 0
ALTER TABLE "item_images" ADD COLUMN "order_index" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Update existing rows to have proper order_index based on creation order
WITH numbered_images AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY created_at) - 1 as new_order
  FROM item_images
)
UPDATE item_images 
SET order_index = numbered_images.new_order
FROM numbered_images
WHERE item_images.id = numbered_images.id;

-- Step 3: Remove the default (new inserts should explicitly provide order_index)
ALTER TABLE "item_images" ALTER COLUMN "order_index" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "item_images_item_id_order_index_idx" ON "item_images"("item_id", "order_index");
