# Backup & Restore Runbook

## Automated Backup (pg_dump)

### Full Backup
```bash
# Staging/Production
pg_dump -h localhost -U postgres -d oi_lend_me -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Docker
docker exec <container> pg_dump -U postgres -d oi_lend_me -F c > backup.dump
```

### Schema-Only
```bash
pg_dump -h localhost -U postgres -d oi_lend_me --schema-only -f schema_backup.sql
```

### Data-Only (for seeding)
```bash
pg_dump -h localhost -U postgres -d oi_lend_me --data-only -f data_backup.sql
```

## Restore

### Full Restore
```bash
# Drop and recreate
dropdb -U postgres oi_lend_me
createdb -U postgres oi_lend_me

# Restore from dump
pg_restore -U postgres -d oi_lend_me backup.dump

# Or from SQL
psql -U postgres -d oi_lend_me < backup.sql
```

### Restore to Test DB
```bash
pg_restore -U test_user -h localhost -p 5433 -d oi_lend_me_test backup.dump
```

## Integrity Verification (post-restore)

```sql
-- 1. Check row counts
SELECT 'users' as t, count(*) FROM users
UNION ALL SELECT 'items', count(*) FROM items
UNION ALL SELECT 'requests', count(*) FROM requests
UNION ALL SELECT 'conversations', count(*) FROM conversations
UNION ALL SELECT 'messages', count(*) FROM messages
UNION ALL SELECT 'groups', count(*) FROM groups;

-- 2. Check FK constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint WHERE contype = 'f'
ORDER BY conrelid::regclass::text;

-- 3. Orphan check
SELECT r.id FROM requests r
LEFT JOIN items i ON r.item_id = i.id WHERE i.id IS NULL;

SELECT m.id FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id WHERE c.id IS NULL;
```

## Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | < 1 hour |
| RTO (Recovery Time Objective) | < 30 minutes |
| Backup Frequency | Nightly (automated) |
| Restore Drill Frequency | Weekly |

## Cron Schedule (Linux)

```cron
# Nightly backup at 2 AM
0 2 * * * pg_dump -U postgres -d oi_lend_me -F c -f /backups/oi_$(date +\%Y\%m\%d).dump 2>&1 | logger -t pgbackup

# Keep last 30 days
0 3 * * * find /backups -name "oi_*.dump" -mtime +30 -delete
```
