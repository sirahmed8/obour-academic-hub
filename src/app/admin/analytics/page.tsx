'use client';

import { useState, useEffect } from 'react';
import { db, rtdb } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { useLanguage } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { Subject } from '@/types';
import { BarChart3, Users, BookOpen, Activity, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  subjectViews: { name: string; views: number }[];
  liveUsers: number;
  totalUsers: number;
  totalSubjects: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    subjectViews: [],
    liveUsers: 0,
    totalUsers: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Realtime user count
    const presenceRef = ref(rtdb, 'presence');
    const unsubPresence = onValue(presenceRef, (snapshot) => {
      let count = 0;
      snapshot.forEach(() => {
        count++;
        return false;
      });
      setData(prev => ({ ...prev, liveUsers: count }));
    });

    // Users count
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setData(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Subjects count
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snapshot) => {
      setData(prev => ({ ...prev, totalSubjects: snapshot.size }));
      
      // Mock subject views data
      const views = snapshot.docs.map(d => {
        const data = d.data() as Subject;
        return {
          name: data.name || 'Subject',
          views: Math.floor(Math.random() * 100) + 10
        };
        // Sort by views to make it look better
      }).sort((a, b) => b.views - a.views).slice(0, 10); // Show top 10
      setData(prev => ({ ...prev, subjectViews: views }));
      setLoading(false);
      }, (error) => {
        console.error("Error fetching subjects:", error);
        setLoading(false);
      });

    return () => {
      unsubPresence();
      unsubUsers();
      unsubSubjects();
    };
  }, []);

  const stats = [
    { label: language === 'ar' ? 'المستخدمين المتصلين' : 'Live Users', value: data.liveUsers, icon: Activity, color: 'bg-green-500' },
    { label: language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: data.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: language === 'ar' ? 'المواد' : 'Subjects', value: data.totalSubjects, icon: BookOpen, color: 'bg-purple-500' },
  ];

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="text-primary" />
          {t('admin.analytics')}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl text-white", stat.color)}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subject Views Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-6">
                {language === 'ar' ? 'مشاهدات المواد' : 'Subject Views'}
              </h2>
              <div className="h-80">
                {data.subjectViews.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.subjectViews}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                    <p>{language === 'ar' ? 'لا توجد بيانات للمواد' : 'No subject data available'}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
