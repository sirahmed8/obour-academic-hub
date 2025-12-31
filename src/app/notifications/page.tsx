'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { Bell, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateArabic } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
      } else {
        // Mock data for demo
        setNotifications([
          {
            id: '1',
            title: language === 'ar' ? 'مرحباً بكم في المنصة الجديدة!' : 'Welcome to the new platform!',
            message: language === 'ar' 
              ? 'تم تحديث المنصة بميزات جديدة. استمتع بتجربة أفضل!'
              : 'The platform has been updated with new features. Enjoy a better experience!',
            type: 'success',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [language]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'success': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 page-transition">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('nav.notifications')}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
            <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const Icon = getIcon(notif.type);
              return (
                <div 
                  key={notif.id} 
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm animate-fade-in-up card-hover"
                  style={{ animationDelay: `${notifications.indexOf(notif) * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", getColors(notif.type))}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{notif.title}</h3>
                      <p className="text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {language === 'ar' ? formatDateArabic(notif.createdAt) : formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
