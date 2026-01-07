# Obour Academic Hub

<div align="center">

![Obour Logo](public/obour-logo.png)

**A modern educational platform for Obour Institutes students**

[![Live Demo](https://img.shields.io/badge/Live-obourinstitutes.web.app-blue?style=for-the-badge)](https://obourinstitutes.web.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)

</div>

---

## 🚀 Tech Stack

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| **Next.js 16**    | App Router with Turbopack         |
| **TypeScript**    | Full type safety                  |
| **Tailwind CSS**  | Utility-first styling             |
| **Firebase**      | Auth, Firestore, Storage, Hosting |
| **Framer Motion** | Smooth animations                 |
| **Cloudinary**    | Image/file uploads                |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard (protected)
│   ├── main/               # Student dashboard
│   ├── subject/            # Subject pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── chat/               # Chat components
│   ├── features/           # Feature components (Chatbot, etc.)
│   ├── layout/             # Layout (Navbar, Sidebar)
│   └── ui/                 # Reusable UI components
├── contexts/               # React Context (Auth, Theme, Language)
├── lib/                    # Utilities & Firebase config
│   └── bot/                # LocalBot engine & knowledge base
├── services/               # Business logic services
└── types/                  # TypeScript definitions
```

## 🔧 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/sirahmed8/obour-academic-hub.git
cd obour-academic-hub
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Firebase, Cloudinary credentials

# 3. Run development server
npm run dev
```

## 🔐 Environment Variables

Required in `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Owner Email
NEXT_PUBLIC_OWNER_EMAIL=
```

## 📱 Features

### For Students

- 📚 Browse subjects and resources
- 🤖 Smart bilingual chatbot (Arabic/English)
- 💬 Live support chat
- 🔔 Real-time notifications
- 🌙 Dark/Light mode
- 🌐 Full RTL/LTR support

### For Admins

- 👥 User management with roles (Owner, Admin, Student)
- 📂 Resource management
- 📊 Analytics dashboard
- 📣 Banner system
- 📬 Inbox for support chats
- 📝 Activity logs

### Smart Chatbot

The platform includes an intelligent local bot with:

- 40+ pre-trained bilingual Q&A pairs
- Automatic language detection
- Live support escalation
- Quick reply suggestions

## 🌐 Deployment

### Firebase Hosting (Recommended)

```bash
# Build static export
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Vercel

Push to main branch - auto-deploys via Vercel integration.

## 🔒 Security

- Firebase Auth with Google Sign-In
- Firestore security rules with role-based access
- Content Security Policy headers
- Profanity filter with word boundary matching
- Secure file uploads via Cloudinary

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ by the Obour Innovators Team
  
  [Connect with Developer](https://linktr.ee/sir.ahmed)
</div>
