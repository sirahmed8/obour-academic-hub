# Security Sentinel

Before security review or code changes, read `AI_STATUS.md` first. Update it after verified work is complete.

## 2024-02-27 - Hardcoded Secrets in Config

**Vulnerability:** Hardcoded Firebase API keys and configuration values can leak into source control when used as fallbacks.
**Learning:** Use environment variables and avoid silent hardcoded fallback secrets.
**Prevention:** Prefer `process.env` or equivalent configuration. The application should fail fast or handle missing configuration gracefully instead of silently using hardcoded secrets.
