# Obour Academic Hub

A modern educational platform for Obour Institutes students, built with Next.js 16 and Firebase.

## 🚀 Tech Stack

| Technology        | Purpose                             |
| ----------------- | ----------------------------------- |
| **Next.js 16**    | App Router framework with Turbopack |
| **TypeScript**    | Full type safety                    |
| **Tailwind CSS**  | Utility-first styling               |
| **Firebase**      | Auth, Firestore, Storage, Hosting   |
| **Framer Motion** | Smooth animations                   |
| **Cloudinary**    | Image optimization                  |
| **Vercel Blob**   | File uploads                        |
| **OpenRouter**    | AI chatbot (free models)            |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard (protected)
│   ├── api/                # API routes
│   │   ├── chat/           # AI chatbot endpoint
│   │   └── upload/         # File upload endpoint
│   ├── main/               # Student dashboard
│   ├── subject/            # Subject pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── chat/               # Chat components
│   ├── features/           # Feature components
│   ├── layout/             # Layout (Navbar, Sidebar)
│   └── ui/                 # Reusable UI components
├── contexts/               # React Context (Auth, Theme, Language)
├── hooks/                  # Custom hooks
├── lib/                    # Utilities & Firebase config
├── services/               # Business logic services
└── types/                  # TypeScript definitions
```

## 🔧 Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd obour-academic-hub
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Firebase, Cloudinary, OpenRouter credentials

# 3. Run development server
npm run dev
```

## 🔐 Environment Variables

Required in `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# ... (see .env.example)

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# OpenRouter (AI)
OPENROUTER_API_KEY=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

## 📱 Features

### For Students

- 📚 Browse subjects and resources
- 🤖 AI-powered chatbot (bilingual AR/EN)
- 💬 Live support chat
- 🔔 Real-time notifications
- 🌙 Dark/Light mode

### For Admins

- 👥 User management with roles
- 📂 Resource management
- 📊 Analytics dashboard
- 📣 Banner system
- 📬 Inbox for support chats

### AI Models Available

| Model       | Description                        |
| ----------- | ---------------------------------- |
| 🧠 Thinking | Deep reasoning (DeepSeek R1)       |
| ⚖️ Balanced | Best for most tasks (GPT-OSS-120B) |
| ⚡ Fast     | Quick responses (Llama 3.3)        |
| ✨ Flash    | Vision support (Gemini 2.0)        |

## 🌐 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Vercel

Push to main branch - auto-deploys via Vercel integration.

## 🔒 Security

- Firebase Auth with Google Sign-In
- Firestore security rules (see `firestore.rules`)
- API routes require Bearer token
- CSP headers configured
- Filename sanitization on uploads

## 📄 License

Proprietary - Obour Institutes © 2025
