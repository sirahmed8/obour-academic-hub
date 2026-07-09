"use client";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, useLanguage } from "@/contexts";
import { FirestoreDate } from "@/types";
import { MessageCircle, ArrowLeft, Send, Shield, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ChatMessage {
  id: string;
  uid: string;
  text: string;
  createdAt: FirestoreDate;
  displayName: string;
  role: string;
}

interface GlobalChatProps {
  isEmbedded?: boolean;
}

export function GlobalChat({ isEmbedded = false }: GlobalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db) return () => {};

    // Fetch last 100 messages
    const q = query(collection(db, "global_chat"), orderBy("createdAt", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    if (cooldown > 0) {
      toast.error(
        language === "ar"
          ? `يرجى الانتظار ${cooldown} ثانية قبل إرسال رسالة أخرى.`
          : `Please wait ${cooldown}s before sending another message.`
      );
      return;
    }

    setIsSending(true);
    if (!db) {
      toast.error(
        language === "ar" ? "الاتصال بقاعدة البيانات غير متاح" : "Database connection not valid"
      );
      setIsSending(false);
      return;
    }

    try {
      await addDoc(collection(db, "global_chat"), {
        uid: user.uid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        displayName: user.displayName || "Anonymous Student",
        role: user.role || "student",
      });

      // Award 2 points for sending a message in Global Chat
      try {
        await updateDoc(doc(db, "users", user.uid), {
          points: increment(2),
        });
      } catch (err) {
        console.error("Failed to award points for chat message:", err);
      }

      setNewMessage("");
      // Set 5-second spam cooldown
      setCooldown(5);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isEmbedded) {
    return (
      <div className="flex flex-col h-full bg-card/30 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-xl">
        {/* Chat Header */}
        <div className="shrink-0 flex items-center gap-3 p-4 border-b border-border/30 bg-card/50">
          <div className="p-2 bg-primary/10 rounded-xl">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {language === "ar" ? "الدردشة العامة" : "Global Chat"}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              {messages.length} {language === "ar" ? "رسالة" : "messages"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
              <div className="p-4 bg-muted/30 rounded-2xl mb-3">
                <MessageCircle className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">
                {language === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.uid === user?.uid;
              const showAvatar = idx === 0 || messages[idx - 1].uid !== msg.uid;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"} gap-2`}
                  >
                    {!isMe && showAvatar && (
                      <div className="shrink-0 pt-1">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 font-bold flex items-center justify-center text-primary text-[10px] border border-primary/20">
                          {(msg.displayName || "?").charAt(0)}
                        </div>
                      </div>
                    )}
                    {!isMe && !showAvatar && <div className="w-7 shrink-0" />}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {showAvatar && !isMe && (
                        <div className="flex items-center gap-1 mb-0.5 px-1 text-[10px] text-muted-foreground">
                          <span className="font-bold text-foreground/80">{msg.displayName}</span>
                          {msg.role === "admin" && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded flex items-center gap-0.5 font-bold">
                              <ShieldAlert className="w-2.5 h-2.5" /> ADMIN
                            </span>
                          )}
                          {msg.role === "owner" && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold border border-amber-500/20">
                              <Shield className="w-2.5 h-2.5" /> OWNER
                            </span>
                          )}
                          {msg.role === "moderator" && (
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold border border-green-500/20">
                              <Shield className="w-2.5 h-2.5" /> MOD
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-[13px] ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted/50 text-foreground border border-border/30 rounded-tl-sm"
                        }`}
                      >
                        <p className="break-all leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 p-3 bg-card/60 border-t border-border/30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={language === "ar" ? "اكتب رسالتك..." : "Type a message..."}
              disabled={isSending || !user}
              className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground text-sm"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim() || !user || cooldown > 0}
              className={`px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-sm ${
                cooldown > 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50"
              }`}
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{cooldown}s</span>
                </>
              ) : isSending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-t-2 border-b-2 border-primary-foreground" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          {!user && (
            <p className="text-xs text-center text-destructive mt-2 font-medium">
              {language === "ar" ? "يجب تسجيل الدخول للدردشة" : "Log in to chat"}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full-page styling
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-screen flex flex-col pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-4 shrink-0"
      >
        <Link
          href="/community"
          className="p-2.5 hover:bg-muted rounded-xl transition-colors border border-border/50"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            {language === "ar" ? "الدردشة العامة" : "Global Chat"}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">
            {language === "ar"
              ? "تواصل ودردش مع جميع الطلاب"
              : "Connect and converse with fellow students"}
          </p>
        </div>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-card/50 backdrop-blur-xl rounded-3xl shadow-xl border border-border/50 flex flex-col overflow-hidden relative"
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="p-4 bg-muted/30 rounded-2xl mb-4">
                <MessageCircle className="w-10 h-10 opacity-30" />
              </div>
              <p className="font-medium">
                {language === "ar"
                  ? "لا توجد رسائل بعد. ابدأ المحادثة!"
                  : "No messages yet. Start the conversation!"}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isCurrentUser = msg.uid === user?.uid;
              const showAvatar = idx === 0 || messages[idx - 1].uid !== msg.uid;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"} gap-2.5`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <div className="shrink-0 pt-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 font-bold flex items-center justify-center text-primary text-xs border border-primary/20">
                          {(msg.displayName || "?").charAt(0)}
                        </div>
                      </div>
                    )}

                    {/* Add spacing if avatar is hidden to keep alignment */}
                    {!isCurrentUser && !showAvatar && <div className="w-8 shrink-0" />}

                    <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                      {showAvatar && !isCurrentUser && (
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-muted-foreground">
                          <span className="font-bold text-foreground/80">{msg.displayName}</span>
                          {msg.role === "admin" && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-bold tracking-wide leading-none border border-primary/20">
                              <ShieldAlert className="w-3 h-3" /> ADMIN
                            </span>
                          )}
                          {msg.role === "owner" && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-bold tracking-wide leading-none border border-amber-500/20">
                              <Shield className="w-3 h-3" /> OWNER
                            </span>
                          )}
                          {msg.role === "moderator" && (
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-bold tracking-wide leading-none border border-green-500/20">
                              <Shield className="w-3 h-3" /> MOD
                            </span>
                          )}
                        </div>
                      )}

                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted/50 text-foreground border border-border/30 rounded-tl-sm"
                        }`}
                      >
                        <p className="break-all leading-relaxed whitespace-pre-wrap text-sm">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-card/80 backdrop-blur-md border-t border-border/30">
          <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={language === "ar" ? "اكتب رسالتك..." : "Type your message..."}
              disabled={isSending || !user}
              className="flex-1 bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground text-sm font-medium"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim() || !user || cooldown > 0}
              className={`px-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                cooldown > 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>{cooldown}s</span>
                </>
              ) : isSending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-t-2 border-b-2 border-primary-foreground"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          {!user && (
            <p className="text-sm text-center text-destructive mt-2 font-medium">
              {language === "ar" ? "يجب تسجيل الدخول للدردشة." : "You must be logged in to chat."}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
