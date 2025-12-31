'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useLanguage, useAuth } from '@/contexts';
import { AppShell } from '@/components/layout/AppShell';
import { MessageSquare, Send, Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { InboxMessage } from '@/types';
import { formatDate, formatDateArabic } from '@/lib/utils';
import Image from 'next/image';

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const { language, t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'inbox'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InboxMessage)));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inbox:", error);
        setLoading(false);
        toast.error(language === 'ar' ? 'فشل تحميل الرسائل' : 'Failed to load messages');
      }
    );
    return () => unsubscribe();
  }, []);

  const sendReply = async () => {
    if (!selectedMessage || !reply.trim()) return;

    setSending(true);
    try {
      await updateDoc(doc(db, 'inbox', selectedMessage.id), {
        status: 'replied',
        adminReply: reply.trim(),
        adminReplyAt: new Date().toISOString(),
        repliedBy: user?.email,
      });
      toast.success(language === 'ar' ? 'تم إرسال الرد' : 'Reply sent');
      setReply('');
      setSelectedMessage(null);
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الإرسال' : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <MessageSquare className="text-primary" />
          {t('admin.inbox')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold">{language === 'ar' ? 'الرسائل' : 'Messages'}</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={30} /></div>
              ) : messages.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">{language === 'ar' ? 'لا توجد رسائل' : 'No messages'}</div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={cn(
                      "p-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors",
                      selectedMessage?.id === msg.id && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Image 
                        src={`https://ui-avatars.com/api/?name=${msg.userName}&background=6366f1&color=fff`}
                        alt={msg.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-foreground truncate">{msg.userName}</p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            msg.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          )}>
                            {msg.status === 'replied' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'ar' ? formatDateArabic(msg.timestamp) : formatDate(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reply Panel */}
          <div className="bg-card rounded-2xl border border-border p-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-foreground">{selectedMessage.userName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMessage.userEmail}</p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-xl">
                  <p className="text-foreground">{selectedMessage.message}</p>
                </div>

                {selectedMessage.adminReply ? (
                  <div className="bg-primary/10 p-4 rounded-xl">
                    <p className="text-sm font-medium text-primary mb-1">{language === 'ar' ? 'ردك:' : 'Your reply:'}</p>
                    <p className="text-foreground">{selectedMessage.adminReply}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب ردك...' : 'Write your reply...'}
                      className="w-full rounded-xl border border-border px-4 py-3 bg-background h-32 resize-none"
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !reply.trim()}
                      className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                      {language === 'ar' ? 'إرسال الرد' : 'Send Reply'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'اختر رسالة للرد عليها' : 'Select a message to reply'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
