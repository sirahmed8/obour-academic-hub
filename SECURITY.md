# Security Policy

## Supported Versions

| Version | Supported         |
| ------- | ----------------- |
| 1.x.x   | ✅ Active support |

## Security Features

### Authentication

- **Google OAuth 2.0** via Firebase Authentication
- No password storage - delegated to Google
- Session management with Firebase tokens

### Authorization

- **Role-based access control** (Owner, Admin, Student)
- Firestore security rules enforce permissions
- Owner email hardcoded for emergency access

### Data Protection

- All data encrypted in transit (HTTPS)
- Firebase manages encryption at rest
- No sensitive data stored in localStorage

### Content Security

- **CSP headers** configured in middleware
- XSS protection enabled
- Frame options set to DENY
- Profanity filter with word boundaries

### File Uploads

- Cloudinary handles file sanitization
- File type validation on client and server
- Size limits enforced

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email the maintainer directly via [linktr.ee/sir.ahmed](https://linktr.ee/sir.ahmed)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix deployment**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release cycle

## Security Best Practices for Contributors

1. Never commit API keys or secrets
2. Use environment variables for all credentials
3. Validate all user input
4. Follow the principle of least privilege
5. Keep dependencies updated

---

Thank you for helping keep Obour Academic Hub secure! 🔒
