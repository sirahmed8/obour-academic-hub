# Obour Academic Hub

A modern educational platform for Obour Institutes students, built with Next.js and Firebase.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Custom CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **Media**: Cloudinary (Image optimization)
- **Animations**: Framer Motion
- **Language**: TypeScript

## 📁 Project Structure

\`\`\`
src/
├── app/ # Next.js App Router pages
│ ├── admin/ # Admin dashboard pages
│ ├── main/ # Main dashboard
│ └── ...
├── components/
│ ├── features/ # Feature components (Chatbot, Dashboard, etc.)
│ ├── layout/ # Layout components (Navbar, Sidebar, AppShell)
│ └── ui/ # Reusable UI components
├── contexts/ # React Context providers
├── hooks/ # Custom React hooks
├── lib/ # Utility functions & Firebase config
└── types/ # TypeScript type definitions
\`\`\`

## 🔧 Setup

1. Clone the repository
2. Copy \`.env.example\` to \`.env.local\` and fill in your credentials
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔐 Environment Variables

See \`.env.example\` for required environment variables.

## 📱 Features

- **Student Dashboard**: View subjects, resources, and notifications
- **AI Chatbot**: Bilingual support bot with live support handoff
- **Admin Panel**: Manage users, resources, notifications, and banners
- **Real-time Chat**: Live support with message replies and reactions
- **Responsive Design**: Optimized for mobile and desktop

## 🌐 Deployment

Deploy to Firebase Hosting:
\`\`\`bash
npm run build
firebase deploy
\`\`\`

## 📄 License

Proprietary - Obour Institutes
