'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, limit } from 'firebase/firestore';
import { useLanguage } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatDateArabic } from '@/lib/utils';
import { ActivityLog } from '@/types';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog)));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const clearLogs = async () => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من مسح جميع السجلات؟' : 'Are you sure you want to clear all logs?')) return;
    
    try {
      const batch = logs.slice(0, 50); // Clear first 50
      await Promise.all(batch.map(log => deleteDoc(doc(db, 'logs', log.id))));
      toast.success(language === 'ar' ? 'تم مسح السجلات' : 'Logs cleared');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل المسح' : 'Failed to clear');
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileText className="text-primary" />
            {t('admin.logs')}
          </h1>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Trash2 size={18} />
            {language === 'ar' ? 'مسح السجلات' : 'Clear Logs'}
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">{language === 'ar' ? 'لا توجد سجلات' : 'No logs found'}</div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log.userEmail}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {language === 'ar' ? formatDateArabic(log.timestamp) : formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
