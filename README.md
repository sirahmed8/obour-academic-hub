# Obour Academic Hub

<div align="center">

![Obour Logo](public/obour-logo.png)

**🎓 A Premium Educational Platform for Obour Institutes**

[![Live Demo](https://img.shields.io/badge/🚀_Live-obourinstitutes.web.app-6366f1?style=for-the-badge)](https://obourinstitutes.web.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Powered-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

</div>

---

## ✨ Highlights

- 🌗 **Live Blur Glassmorphism** - Premium UI with GPU-optimized backdrop blur
- 🤖 **AI Chatbot** - Bilingual (Arabic/English) with 40+ pre-trained responses
- 📱 **Mobile-First** - Fully responsive with smooth animations
- 🔐 **Role-Based Access** - Owner, Admin, Student permissions
- 🌐 **RTL Support** - Full Arabic language support

---

## 🛠️ Tech Stack

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| **Next.js 15**    | App Router + Turbopack            |
| **TypeScript**    | Full type safety                  |
| **Tailwind CSS**  | Utility-first styling             |
| **Firebase**      | Auth, Firestore, Storage, Hosting |
| **Framer Motion** | Smooth, GPU-optimized animations  |
| **Cloudinary**    | Image/file uploads                |

---

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── admin/           # Admin dashboard (protected)
│   ├── main/            # Student dashboard
│   └── todo/            # Task management
├── components/
│   ├── features/        # Chatbot, Dashboard, Todo
│   ├── layout/          # Navbar, Sidebar, AppShell
│   └── ui/              # Reusable components
├── contexts/            # Auth, Theme, Language
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & Firebase
│   └── bot/             # LocalBot engine
├── services/            # Business logic
└── types/               # TypeScript definitions
```

---

## 🚀 Quick Start

```bash
# Clone & install
git clone https://github.com/sirahmed8/obour-academic-hub.git
cd obour-academic-hub
npm install

# Configure environment
cp .env.example .env.local
# Fill in Firebase & Cloudinary credentials

# Run dev server
npm run dev
```

## 🔑 Environment Variables

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

# Owner
NEXT_PUBLIC_OWNER_EMAIL=
```

---

## 📱 Features

### For Students

- 📚 Browse subjects & resources
- 🤖 Smart bilingual chatbot
- ✅ Personal task management (Todo)
- 💬 Live support chat
- 🔔 Real-time notifications
- 🌙 Dark/Light mode

### For Admins

- 👥 User management with roles
- 📊 Analytics dashboard
- 📣 Banner system
- 📬 Support inbox
- 📝 Activity logs

---

## 🌐 Deployment

### Firebase Hosting (Recommended)

```bash
npm run build
firebase deploy --only hosting
```

### Vercel

Auto-deploys on push to `main` branch.

---

## 🔒 Security

- Firebase Auth with Google Sign-In
- Firestore security rules with role-based access
- Content Security Policy headers
- GPU-optimized blur without performance compromise

---

## 📄 License

[MIT License](LICENSE) - © 2026 Obour Academic Hub

---

<div align="center">
  
  Made with ❤️ by **Sir Ahmed**
  
  [![Connect](https://img.shields.io/badge/Connect-linktr.ee/sir.ahmed-green?style=for-the-badge)](https://linktr.ee/sir.ahmed)

</div>
