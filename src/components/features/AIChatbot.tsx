'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, WifiOff, Headphones } from 'lucide-react';
import { useAuth, useLanguage } from '@/contexts';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type ChatMode = 'ai' | 'offline' | 'live';

// Offline responses for common questions
const OFFLINE_RESPONSES: Record<string, { en: string; ar: string }> = {
  'hello|hi|مرحبا|السلام': {
    en: 'Hello! I\'m your Academic Assistant. How can I help you today?',
    ar: 'مرحباً! أنا مساعدك الأكاديمي. كيف يمكنني مساعدتك اليوم؟'
  },
  'help|مساعدة': {
    en: 'I can help you with: \n• Finding study materials\n• Explaining concepts\n• Answering questions about your subjects\n• Connecting you to live support',
    ar: 'يمكنني مساعدتك في:\n• إيجاد مواد الدراسة\n• شرح المفاهيم\n• الإجابة على أسئلتك حول موادك\n• توصيلك بالدعم المباشر'
  },
  'thanks|شكر': {
    en: 'You\'re welcome! Feel free to ask if you need anything else.',
    ar: 'على الرحب والسعة! لا تتردد في السؤال إذا احتجت شيئاً آخر.'
  },
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOfflineResponse = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    for (const [pattern, response] of Object.entries(OFFLINE_RESPONSES)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerQuery)) {
        return language === 'ar' ? response.ar : response.en;
      }
    }
    return null;
  };

  const sendToLiveSupport = async (message: string) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'inbox'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      
      return language === 'ar' 
        ? 'تم إرسال رسالتك للدعم. سيتم الرد عليك قريباً.'
        : 'Your message has been sent to support. We\'ll get back to you soon.';
    } catch (error) {
      console.error('Failed to send to inbox:', error);
      return language === 'ar' 
        ? 'فشل إرسال الرسالة. حاول مرة أخرى.'
        : 'Failed to send message. Please try again.';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response: string;

      if (mode === 'offline') {
        const offlineResponse = getOfflineResponse(userMessage.content);
        response = offlineResponse || (language === 'ar' 
          ? 'عذراً، لا أستطيع الإجابة على هذا السؤال في الوضع غير المتصل.'
          : 'Sorry, I cannot answer this question in offline mode.');
      } else if (mode === 'live') {
        response = await sendToLiveSupport(userMessage.content) || '';
      } else {
        // AI Mode - call API
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage.content, language }),
        });
        
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        response = data.response;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ. جرب الوضع غير المتصل.'
          : 'Sorry, an error occurred. Try offline mode.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: 'ai' as ChatMode, icon: Bot, label: 'AI' },
    { id: 'offline' as ChatMode, icon: WifiOff, label: language === 'ar' ? 'محلي' : 'Offline' },
    { id: 'live' as ChatMode, icon: Headphones, label: language === 'ar' ? 'دعم' : 'Live' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform",
          language === 'ar' ? 'left-6' : 'right-6',
          isOpen && 'hidden'
        )}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn",
          language === 'ar' ? 'left-6' : 'right-6'
        )}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot size={24} />
              <div>
                <h3 className="font-bold">{t('chat.assistant')}</h3>
                <p className="text-xs opacity-80">
                  {mode === 'ai' ? 'AI' : mode === 'offline' ? t('chat.offline') : t('chat.liveSupport')}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex border-b border-border">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex-1 py-2 flex items-center justify-center gap-2 text-sm transition-colors",
                    mode === m.id 
                      ? "bg-primary/10 text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={16} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot size={40} className="mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'اسألني أي شيء!' : 'Ask me anything!'}</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="bg-muted p-3 rounded-2xl w-fit">
                <Loader2 className="animate-spin w-5 h-5" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
