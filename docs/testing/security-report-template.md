# Security Report Template

## Scan Information
| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Tool(s) | Semgrep / npm audit / OWASP ZAP |
| Scope | Full codebase / API endpoints |
| Scanned By | |

## Summary
| Severity | Count | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | | | |
| High | | | |
| Medium | | | |
| Low | | | |
| Info | | | |

## Findings

### Critical

#### [CRIT-001] Finding Title
- **Location**: `file:line`
- **Description**: 
- **Impact**: 
- **Remediation**: 
- **Status**: Open / Fixed / Accepted Risk
- **Fix ETA**: 

### High

#### [HIGH-001] Finding Title
- **Location**: `file:line`
- **Description**: 
- **Remediation**: 
- **Status**: 

### Medium / Low
(List findings here)

## Dependency Vulnerabilities
| Package | Severity | CVE | Fix Version | Status |
|---------|----------|-----|-------------|--------|
| | | | | |

## Security Headers Check
| Header | Expected | Actual | Status |
|--------|----------|--------|--------|
| X-Content-Type-Options | nosniff | | |
| X-Frame-Options | DENY | | |
| Strict-Transport-Security | max-age=31536000 | | |
| Content-Security-Policy | (defined) | | |

## Remediation SLA
| Severity | Fix Deadline |
|----------|-------------|
| Critical | 24 hours |
| High | 7 days |
| Medium | 30 days |
| Low | Next sprint |
