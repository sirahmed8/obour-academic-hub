'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { Users, Shield, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';
import Image from 'next/image';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserType)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(language === 'ar' ? `تغيير الدور إلى ${newRole}؟` : `Change role to ${newRole}?`)) return;

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success(language === 'ar' ? 'تم تحديث الدور' : 'Role updated');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Update failed');
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <Users className="text-primary" />
          {t('admin.users')}
        </h1>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">{language === 'ar' ? 'كود الطالب' : 'Student Code'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">{language === 'ar' ? 'الدور' : 'Role'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={30} /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">{language === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Image 
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                            alt={user.displayName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <div className="font-bold text-foreground">{user.displayName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {user.studentCode || <span className="text-muted-foreground italic">{language === 'ar' ? 'غير محدد' : 'Not set'}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          user.role === 'owner' ? 'bg-amber-100 text-amber-800' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        )}>
                          {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'owner' && (
                          <button 
                            onClick={() => toggleRole(user.uid, user.role)}
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                          >
                            {language === 'ar' ? 'تبديل الدور' : 'Switch Role'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
