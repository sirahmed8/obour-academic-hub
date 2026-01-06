# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ErrorBoundary component for graceful error handling
- Client-side search with keyboard shortcuts (Cmd/Ctrl+K)
- Skip-to-content link for keyboard navigation
- Comprehensive test suite with Vitest and React Testing Library
- Pre-commit hooks with Husky and lint-staged
- CI/CD pipeline with GitHub Actions
- OpenGraph and Twitter meta tags for social sharing
- Content Security Policy headers
- Firestore composite indexes for chat queries
- Prettier configuration for consistent code formatting

### Changed

- Enabled TypeScript strict mode
- Removed 296 unused dependencies (~500KB bundle reduction)
- Added preconnect links for Google Fonts optimization

### Fixed

- Removed console.log statements from production code
- Fixed ARIA accessibility issues in search component
- Improved type safety across utility functions

### Security

- Added comprehensive CSP headers
- Implemented strict Firebase security rules
- Added security headers (HSTS, X-Frame-Options, etc.)

## [0.1.0] - 2026-01-03

### Added

- Initial project setup
- Firebase authentication and Firestore integration
- Real-time chat system
- Admin dashboard
- Multi-language support (English/Arabic)
- Dark mode support
- PWA manifest and service worker
- Cloudinary image uploads
