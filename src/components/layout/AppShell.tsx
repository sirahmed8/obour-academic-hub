'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useLanguage } from '@/contexts';
import { Sidebar, Navbar } from '@/components/layout';
import { LoginScreen } from '@/components/features/LoginScreen';
import { StudentProfileSetup } from '@/components/features/StudentProfileSetup';
import { AIChatbot } from '@/components/features/AIChatbot';
import { Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user, loading } = useAuth();
  const { dir } = useLanguage();

  const router = useRouter();

  // ... existing simple side effects ...

  useEffect(() => {
    // Check if profile is incomplete
    if (user && (!user.studentCode || user.studentCode.length !== 6)) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [user]);

  // Protect route with useEffect to avoid render-loop
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir={dir}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-10">
          {children}
        </main>
        <AIChatbot />
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <StudentProfileSetup onComplete={() => setShowProfileSetup(false)} />
      )}
    </div>
  );
}
