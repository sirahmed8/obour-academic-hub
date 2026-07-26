"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Calendar,
  ListTodo,
  Bot,
  User,
  Plus,
  Loader2,
} from "lucide-react";
import { useLanguage, useAuth } from "@/contexts";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { modalBackdrop } from "@/lib/motion";

interface ParsedTaskSpec {
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  subtasks?: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  taskSpec?: ParsedTaskSpec;
  isAdded?: boolean;
}

interface AITaskAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

function parseTaskResponse(content: string): { cleanText: string; taskSpec?: ParsedTaskSpec } {
  const match = content.match(/\[TASK_SPEC:\s*({[\s\S]*?})\]/);
  let taskSpec: ParsedTaskSpec | undefined = undefined;
  let cleanText = content;

  if (match && match[1]) {
    try {
      taskSpec = JSON.parse(match[1]);
      cleanText = content.replace(match[0], "").trim();
    } catch {
      console.warn("Failed to parse TASK_SPEC JSON from AI output");
    }
  }

  return { cleanText, taskSpec };
}

export function AITaskAssistantModal({
  isOpen,
  onClose,
  onTaskCreated,
}: AITaskAssistantModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";
  const [mounted, setMounted] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const userName = user?.displayName?.split(" ")[0] || (isRtl ? "يا طالبنا" : "Student");
      const initialGreeting: ChatMessage = {
        id: "init-welcome",
        role: "assistant",
        text: isRtl
          ? `أهلاً بك يا ${userName}! 🎓 أنا مساعد التخطيط الذكي للمهام. أخبرني ماذا ترغب في إنجازه أو مذاكرته اليوم، وسأساعدك في صياغته وتقسيمه إلى خطوات وإضافته لجدولك فوراً!`
          : `Welcome ${userName}! 🎓 I am your AI Task Assistant. Tell me what you'd like to accomplish or study today, and I'll help you structure it, break it into subtasks, and add it directly to your To-Do list!`,
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, messages.length, isRtl, user]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isGenerating]);

  const handleSend = async (textOverride?: string) => {
    const queryText = textOverride || input;
    if (!queryText.trim() || isGenerating) return;

    if (!textOverride) {
      setInput("");
    }

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const history = [...messages, userMsg].slice(-6).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const data = await apiFetch<{ content: string }>("/api/ai/task-planner", {
        method: "POST",
        body: { messages: history },
      });

      const { cleanText, taskSpec } = parseTaskResponse(data.content || "");

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        role: "assistant",
        text:
          cleanText ||
          (isRtl
            ? "تم إعداد خطة المهمة! يمكنك مراجعتها وإضافتها بضغطة زر."
            : "Task plan created! Review and add it with one click."),
        taskSpec,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const isEnglishInput = /[a-zA-Z]/.test(queryText) && !/[\u0600-\u06FF]/.test(queryText);
      const errMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        text: isEnglishInput
          ? "Sorry, a temporary network error occurred. Please try again in a moment."
          : "عذراً، حدث خطأ مؤقت في الاتصال. يرجى المحاولة مرة أخرى.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTaskToFirestore = async (msgId: string, spec: ParsedTaskSpec) => {
    if (!user || !db || addingTaskId) return;

    setAddingTaskId(msgId);
    try {
      const taskData = {
        title: spec.title,
        description: spec.description || "",
        priority: spec.priority || "medium",
        dueDate: spec.dueDate || null,
        repeat: "none",
        subjectId: null,
        subtasks: (spec.subtasks || []).map((st) => ({
          id: crypto.randomUUID(),
          title: st,
          completed: false,
        })),
        userId: user.uid,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderIndex: 0,
      };

      await addDoc(collection(db, `users/${user.uid}/tasks`), taskData);

      // Trigger Confetti
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      toast.success(
        isRtl ? `🎉 تم إضافة المهمة "${spec.title}" بنجاح!` : `🎉 Task "${spec.title}" added!`
      );

      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, isAdded: true } : m)));

      onTaskCreated?.();
    } catch (err) {
      console.error(err);
      toast.error(isRtl ? "حدث خطأ أثناء إضافة المهمة" : "Failed to add task");
    } finally {
      setAddingTaskId(null);
    }
  };

  const starterPrompts = isRtl
    ? [
        "💡 أريد تنظيم جدول مذاكرتي لمادة جديدة",
        "📝 عندي تسليم مشروع أكاديمي محتاج تقسيم الخطوات",
        "⏰ إضافة مهمة مراجعة سريعة قبل الاختبار القادم",
      ]
    : [
        "💡 Help me plan my study schedule for a new course",
        "📝 I have an academic project due soon, break it into steps",
        "⏰ Remind me to review for my upcoming exam",
      ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdrop}
          className="fixed inset-0 z-999 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="w-full max-w-2xl h-[85vh] max-h-[720px] bg-background/95 border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-background flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    {isRtl ? "مساعد المهام الذكي" : "AI Task Planner"}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      AI Powered
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isRtl
                      ? "تحدث مع الذكاء الاصطناعي لتحويل أفكارك إلى مهام منظمة بنقرة واحدة"
                      : "Chat with AI to convert your ideas into actionable tasks"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 items-start max-w-[88%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-md",
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white"
                        : "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                        msg.role === "user"
                          ? "bg-purple-600 text-white rounded-tr-none font-medium"
                          : "bg-card/90 border border-border/60 text-card-foreground rounded-tl-none"
                      )}
                    >
                      {msg.text}
                    </div>

                    {/* Proposed Task Card */}
                    {msg.taskSpec && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-950/40 via-background to-indigo-950/30 border border-purple-500/40 p-4 rounded-2xl shadow-lg space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ListTodo className="w-5 h-5 text-purple-400 shrink-0" />
                            <h4 className="font-bold text-sm text-foreground">
                              {msg.taskSpec.title}
                            </h4>
                          </div>

                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border shrink-0",
                              msg.taskSpec.priority === "high" &&
                                "bg-red-500/10 text-red-400 border-red-500/30",
                              msg.taskSpec.priority === "medium" &&
                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                              msg.taskSpec.priority === "low" &&
                                "bg-green-500/10 text-green-400 border-green-500/30"
                            )}
                          >
                            {msg.taskSpec.priority} priority
                          </span>
                        </div>

                        {msg.taskSpec.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {msg.taskSpec.description}
                          </p>
                        )}

                        {msg.taskSpec.dueDate && (
                          <div className="flex items-center gap-1.5 text-xs text-purple-300">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {isRtl ? "تاريخ الاستحقاق: " : "Due: "}
                              {new Date(msg.taskSpec.dueDate).toLocaleString(
                                isRtl ? "ar-EG" : "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        )}

                        {msg.taskSpec.subtasks && msg.taskSpec.subtasks.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-border/40">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              {isRtl ? "خطوات التنفيذ الموصى بها:" : "Recommended Subtasks:"}
                            </span>
                            <div className="space-y-1">
                              {msg.taskSpec.subtasks.map((st, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-foreground/90 bg-muted/30 px-2.5 py-1 rounded-lg"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span>{st}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={msg.isAdded || addingTaskId === msg.id}
                          onClick={() => handleAddTaskToFirestore(msg.id, msg.taskSpec!)}
                          className={cn(
                            "w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md",
                            msg.isAdded
                              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] shadow-purple-500/25"
                          )}
                        >
                          {addingTaskId === msg.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{isRtl ? "جاري الإضافة..." : "Adding..."}</span>
                            </>
                          ) : msg.isAdded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>{isRtl ? "تمت الإضافة لمهامك ✓" : "Added to To-Do ✓"}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>
                                {isRtl ? "إضافة إلى قائمة مهامي" : "Add to My To-Do List"}
                              </span>
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3 items-start max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                    🤖
                  </div>
                  <div className="p-4 bg-card/90 border border-border/60 rounded-2xl rounded-tl-none space-y-2">
                    <div className="flex gap-1.5 items-center">
                      <div
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="text-xs text-muted-foreground ml-2">
                        {isRtl ? "جاري تحليل واقتراح المهمة..." : "Planning task..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter Prompts (if chat is fresh) */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-border/30 bg-muted/10 shrink-0">
                <p className="text-[11px] font-bold text-muted-foreground mb-2">
                  {isRtl ? "أفكار سريعة للبدء:" : "Quick Ideas:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-border/50 bg-background shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isRtl
                      ? "اشرح مهمتك أو خطتك هنا (مثال: عندي مشروع مادة البرمجة الخميس القادم)..."
                      : "Describe your task or goal (e.g. Database project due next Thursday)..."
                  }
                  className="flex-1 bg-muted/30 border border-border/50 focus:border-purple-500/60 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  disabled={isGenerating}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 transition-all"
                >
                  <Send className={cn("w-4 h-4", isRtl && "rotate-180")} />
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
