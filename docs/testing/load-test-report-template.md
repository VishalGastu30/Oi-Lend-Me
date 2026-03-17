# Load Test Report Template

## Test Information
| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Environment | Staging / Local |
| Duration | X minutes |
| Scenario | browsing / write / full-2k / stress |
| k6 Version | |

## KPI Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Read p95 Latency | < 800ms | | ✅ / ❌ |
| Write p95 Latency | < 1500ms | | ✅ / ❌ |
| Error Rate | < 1% | | ✅ / ❌ |
| DB CPU (peak) | < 70% | | ✅ / ❌ |
| Max Concurrent VUs | 2,000 | | |
| Total Requests | | | |
| Data Integrity | No violations | | ✅ / ❌ |

## Response Time Distribution
```
p50: ___ms
p90: ___ms
p95: ___ms
p99: ___ms
max: ___ms
```

## Errors Summary
| Error Type | Count | % of Total |
|------------|-------|------------|
| HTTP 5xx | | |
| Timeouts | | |
| Connection Refused | | |

## Bottlenecks Identified
1.
2.

## Remediation Actions
| Action | Priority | Owner | ETA |
|--------|----------|-------|-----|
| | | | |

## Grafana Dashboard Links
- API Performance: [link]
- DB Metrics: [link]
