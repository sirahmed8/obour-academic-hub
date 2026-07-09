# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-03-29

### Added

- **Real-time Presence System**: Live user tracking using Firebase Realtime Database.
- **Solid Mode**: High-performance UI toggle for accessibility and low-end devices.
- **Zero-Read Auth**: Deep integration with Firebase Custom Claims for specialized user roles.
- **Activity Log Persistence**: Real-time logging of user logins and critical actions.

### Changed

- **Popup Login Enforcement**: Migrated all auth flows to `signInWithPopup` for production stability.
- **Analytics Optimization**: Asynchronous batch deletion for historical stats.
- **Enhanced Sidebar**: Added persistent role states to prevent flickering and 9+ notification logic.
- **Tech Stack Upgrade**: Next.js 16.1, React 19.2, Tailwind CSS 4.0.

### Fixed

- **Mobile Navigation Loop**: Resolved redirect issues on mobile production hosts.
- **Admin Inbox Reliability**: Fixed real-time subscription for unread messages.
- **Layout Constraints**: Removed redundant `AppShell` wrappers for fluid full-width UI.

### Security

- Hardened backend with granular error sanitization and CORS.

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
