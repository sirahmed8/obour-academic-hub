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
  deleteDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, useLanguage } from "@/contexts";
import { FirestoreDate } from "@/types";
import {
  MessageCircle,
  ArrowLeft,
  Send,
  Shield,
  ShieldAlert,
  Clock,
  Reply,
  Trash2,
  X,
  Smile,
  CornerDownRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReplyInfo {
  id: string;
  text: string;
  displayName: string;
}

interface ChatMessage {
  id: string;
  uid: string;
  text: string;
  createdAt: FirestoreDate;
  displayName: string;
  role: string;
  replyTo?: ReplyInfo;
  reactions?: Record<string, string[]>;
}

interface GlobalChatProps {
  isEmbedded?: boolean;
}

const QUICK_EMOJIS = ["❤️", "👍", "🔥", "😂", "🙏"];

export function GlobalChat({ isEmbedded = false }: GlobalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [replyTo, setReplyTo] = useState<ReplyInfo | null>(null);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db) return () => {};

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (createdAt: FirestoreDate | undefined) => {
    if (!createdAt) return "";
    try {
      const tsObj = createdAt as { toDate?: () => Date };
      const date =
        typeof tsObj?.toDate === "function"
          ? tsObj.toDate()
          : new Date(createdAt as string | number | Date);
      return date.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
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
      const payload: Record<string, unknown> = {
        uid: user.uid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        displayName: user.displayName || "Anonymous Student",
        role: user.role || "student",
      };

      if (replyTo) {
        payload.replyTo = replyTo;
      }

      await addDoc(collection(db, "global_chat"), payload);

      try {
        await updateDoc(doc(db, "users", user.uid), {
          points: increment(2),
        });
      } catch (err) {
        console.error("Failed to award points for chat message:", err);
      }

      setNewMessage("");
      setReplyTo(null);
      setCooldown(5);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleReaction = async (
    msgId: string,
    emoji: string,
    currentReactions: Record<string, string[]> = {}
  ) => {
    if (!user || !db) return;
    const usersForEmoji = currentReactions[emoji] || [];
    const hasReacted = usersForEmoji.includes(user.uid);
    const updatedUsers = hasReacted
      ? usersForEmoji.filter((id) => id !== user.uid)
      : [...usersForEmoji, user.uid];

    const newReactions = {
      ...currentReactions,
      [emoji]: updatedUsers,
    };

    try {
      await updateDoc(doc(db, "global_chat", msgId), {
        reactions: newReactions,
      });
      setActiveReactionMsgId(null);
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "global_chat", msgId));
      toast.success(language === "ar" ? "تم حذف الرسالة" : "Message deleted");
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error(language === "ar" ? "فشل حذف الرسالة" : "Failed to delete message");
    }
  };

  const renderMessageList = () => (
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
          const isMe = msg.uid === user?.uid;
          const showAvatar = idx === 0 || messages[idx - 1].uid !== msg.uid;
          const canDelete =
            user && (user.uid === msg.uid || user.role === "admin" || user.role === "owner");
          const timestamp = formatTime(msg.createdAt);

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
              <div className={`flex max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"} gap-2.5`}>
                {!isMe && showAvatar && (
                  <div className="shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 font-bold flex items-center justify-center text-primary text-xs border border-primary/20">
                      {(msg.displayName || "?").charAt(0)}
                    </div>
                  </div>
                )}

                {!isMe && !showAvatar && <div className="w-8 shrink-0" />}

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0`}>
                  {showAvatar && !isMe && (
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
                    className={`px-3.5 py-2.5 rounded-2xl relative ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/60 text-foreground border border-border/40 rounded-tl-sm"
                    }`}
                  >
                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 rounded-xl text-xs border-s-2 flex flex-col gap-0.5 ${
                          isMe
                            ? "bg-primary-foreground/15 border-primary-foreground text-primary-foreground/90"
                            : "bg-background/60 border-primary text-muted-foreground"
                        }`}
                      >
                        <span className="font-bold text-[11px] flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3" />
                          {msg.replyTo.displayName}
                        </span>
                        <p className="truncate text-[11px]">{msg.replyTo.text}</p>
                      </div>
                    )}

                    <p className="break-all leading-relaxed whitespace-pre-wrap text-sm">
                      {msg.text}
                    </p>

                    {timestamp && (
                      <div
                        className={`text-[10px] mt-1 flex justify-end ${
                          isMe ? "text-primary-foreground/75" : "text-muted-foreground"
                        }`}
                      >
                        {timestamp}
                      </div>
                    )}
                  </div>

                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 px-0.5">
                      {Object.entries(msg.reactions).map(([emoji, usersArr]) => {
                        if (!usersArr || usersArr.length === 0) return null;
                        const reactedByMe = user && usersArr.includes(user.uid);
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji, msg.reactions)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                              reactedByMe
                                ? "bg-primary/15 border-primary/40 text-primary"
                                : "bg-muted/40 border-border/40 text-foreground/80 hover:bg-muted"
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{usersArr.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 opacity-85 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() =>
                        setReplyTo({
                          id: msg.id,
                          text: msg.text,
                          displayName: msg.displayName,
                        })
                      }
                      className="p-1 hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-xs flex items-center gap-1"
                      title={language === "ar" ? "رد" : "Reply"}
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveReactionMsgId((curr) => (curr === msg.id ? null : msg.id))
                        }
                        className="p-1 hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-xs flex items-center gap-1"
                        title={language === "ar" ? "تفاعل" : "React"}
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>

                      <AnimatePresence>
                        {activeReactionMsgId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 4 }}
                            className="absolute z-20 bottom-full mb-1 flex items-center gap-1 p-1.5 bg-popover border border-border rounded-full shadow-lg"
                          >
                            {QUICK_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, emoji, msg.reactions)}
                                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-sm transition-transform active:scale-90"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors text-xs flex items-center gap-1"
                        title={language === "ar" ? "حذف للجميع" : "Delete for all"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderInputForm = () => (
    <div className="shrink-0 p-3 md:p-4 bg-card/80 backdrop-blur-md border-t border-border/30">
      {replyTo && (
        <div className="mb-2 px-3 py-2 bg-muted/50 border border-border/50 rounded-xl flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <span className="font-bold text-primary block truncate">
              {language === "ar" ? "الرد على" : "Replying to"} {replyTo.displayName}
            </span>
            <p className="text-muted-foreground truncate">{replyTo.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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
            <div className="w-4 h-4 animate-spin rounded-full border-t-2 border-b-2 border-primary-foreground" />
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
  );

  if (isEmbedded) {
    return (
      <div className="flex flex-col h-full bg-card/30 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-xl">
        <div className="shrink-0 flex items-center gap-3 p-4 border-b border-border/30 bg-card/50">
          <div className="p-2 bg-primary/10 rounded-xl">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              {language === "ar" ? "الدردشة العامة المباشرة" : "Live Global Chat"}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "تواصل مع زملائك الطلاب في الوقت الفعلي"
                : "Connect with fellow students in real-time"}
            </p>
          </div>
        </div>

        {renderMessageList()}
        {renderInputForm()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-screen flex flex-col pt-20">
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-card/50 backdrop-blur-xl rounded-3xl shadow-xl border border-border/50 flex flex-col overflow-hidden relative"
      >
        {renderMessageList()}
        {renderInputForm()}
      </motion.div>
    </div>
  );
}
