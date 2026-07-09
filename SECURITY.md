# Security Policy

## 🛡️ Supported Versions

| Version | Status            |
| ------- | ----------------- |
| 0.1.x   | ✅ Active support |

## 🔐 Security Features

### Authentication

- **Google OAuth 2.0** via Firebase Authentication
- No password storage - delegated to Google
- Secure session management with Firebase tokens

- **Role-based access control**: Owner > Admin > Student
- **Owner Privilege Isolation**: `owner` privileges are strictly hardcoded to the environment-configured email (`NEXT_PUBLIC_OWNER_EMAIL`). Firestore role markers for `owner` are treated as `admin` if the email does not match, preventing unauthorized role elevation.
- **Rollback Protection**: Unauthorized attempts to assign the `owner` role via API or Firestore are blocked by server-side validation and secure Firestore rules.

### Data Protection

- ✅ All data encrypted in transit (HTTPS)
- ✅ Firebase manages encryption at rest
- ✅ No sensitive data in localStorage/cookies

### Content Security

- Content Security Policy (CSP) headers
- XSS protection enabled
- Frame options: DENY
- Profanity filter with word boundary matching

### Performance Security

- GPU-optimized blur with CSS containment
- `will-change` and `contain` properties for isolation
- No memory leaks from animation subscriptions

## 🚨 Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

### How to Report

1. Contact the maintainer directly via [linktr.ee/sir.ahmed](https://linktr.ee/sir.ahmed)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Severity    | Response Time |
| ----------- | ------------- |
| 🔴 Critical | 24-48 hours   |
| 🟠 High     | 1 week        |
| 🟡 Medium   | 2 weeks       |
| 🟢 Low      | Next release  |

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week

## 🔒 Best Practices for Contributors

1. ❌ Never commit API keys or secrets
2. ✅ Use environment variables for credentials
3. ✅ Validate all user input
4. ✅ Follow principle of least privilege
5. ✅ Keep dependencies updated (`npm audit`)

Thank you for helping keep Obour Academic Hub secure! 🔒
