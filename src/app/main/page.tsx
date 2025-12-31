'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/components/features/Dashboard';

export default function MainPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
