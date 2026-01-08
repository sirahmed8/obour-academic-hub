"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts";
import { Bell, Send, Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [target, setTarget] = useState<"all" | "admins">("all");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  // t and language removed as unused
  // const { t, language } = useLanguage();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        type,
        target,
        readBy: [],
        createdAt: new Date().toISOString(),
        createdBy: user?.uid,
      });
      toast.success("Notification sent successfully");
      setTitle("");
      setMessage("");
      setType("info");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <div className="w-full p-6 space-y-8 page-transition">
        <FadeIn className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Send Notifications</h1>
        </FadeIn>

        <ScaleIn delay={0.1} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification Title"
                className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification Message"
                rows={4}
                className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-2">
                  {[
                    { val: "info", icon: Info, color: "text-blue-500" },
                    {
                      val: "warning",
                      icon: AlertTriangle,
                      color: "text-yellow-500",
                    },
                    {
                      val: "success",
                      icon: CheckCircle,
                      color: "text-green-500",
                    },
                  ].map((option) => (
                    <button
                      key={option.val}
                      type="button"
                      onClick={() => setType(option.val as "info" | "warning" | "success")}
                      className={cn(
                        "flex-1 p-2 rounded-lg border flex justify-center items-center gap-2 transition-all",
                        type === option.val
                          ? "bg-primary/10 border-primary ring-1 ring-primary"
                          : "border-input hover:bg-muted"
                      )}
                    >
                      <option.icon className={`w-4 h-4 ${option.color}`} />
                      <span className="capitalize text-sm">{option.val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as "all" | "admins")}
                  className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Users</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Notification
                </>
              )}
            </button>
          </form>
        </ScaleIn>
      </div>
    </AppShell>
  );
}
