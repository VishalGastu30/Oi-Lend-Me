-- Views
CREATE OR REPLACE VIEW available_items_view AS
SELECT i.id, i.name, i.category, i.image_url, i.owner_id, i.group_id, i.created_at
FROM items i
WHERE i.status = 'AVAILABLE';

CREATE OR REPLACE VIEW active_borrows_view AS
SELECT r.id as request_id, 
       r.item_id, 
       r.requester_id, 
       r.status, 
       r.start_date, 
       r.end_date,
       i.name as item_name,
       u.name as requester_name,
       i.image_url as item_image
FROM requests r
JOIN items i ON r.item_id = i.id
JOIN users u ON r.requester_id = u.id
WHERE r.status IN ('BORROWED', 'APPROVED');

CREATE OR REPLACE VIEW user_reputation_summary AS
SELECT user_id, 
       SUM(change_amount) as total_score, 
       COUNT(*) as log_count,
       MAX(created_at) as last_activity
FROM reputation_logs 
GROUP BY user_id;

-- Trigger Function for Immutability protection
CREATE OR REPLACE FUNCTION protect_reputation_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Deleting reputation logs is strictly forbidden to ensure audit integrity.';
    ELSIF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Updating reputation logs is strictly forbidden to ensure audit integrity.';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger Definition
DROP TRIGGER IF EXISTS enforce_reputation_immutability ON reputation_logs;

CREATE TRIGGER enforce_reputation_immutability
BEFORE DELETE OR UPDATE ON reputation_logs
FOR EACH ROW
EXECUTE FUNCTION protect_reputation_logs();