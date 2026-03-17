-- CreateIndex
CREATE INDEX "group_bookings_updated_at_idx" ON "group_bookings"("updated_at");

-- CreateIndex
CREATE INDEX "group_items_updated_at_idx" ON "group_items"("updated_at");

-- CreateIndex
CREATE INDEX "groups_updated_at_idx" ON "groups"("updated_at");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "requests_updated_at_idx" ON "requests"("updated_at");

-- CreateIndex
CREATE INDEX "requirements_updated_at_idx" ON "requirements"("updated_at");
