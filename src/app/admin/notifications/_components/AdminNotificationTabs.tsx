"use client";

import { Mail, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationTab } from "../types";

interface AdminNotificationTabsProps {
  activeTab: NotificationTab;
  language: string;
  onChange: (tab: NotificationTab) => void;
}

export function AdminNotificationTabs({
  activeTab,
  language,
  onChange,
}: AdminNotificationTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
      <button
        onClick={() => onChange("send")}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-all",
          activeTab === "send"
            ? "bg-background text-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {language === "ar" ? "إرسال إشعار" : "Send Notification"}
      </button>
      <button
        onClick={() => onChange("email")}
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
          activeTab === "email"
            ? "bg-background text-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Mail size={14} />
        {language === "ar" ? "إرسال بريد" : "Send Email"}
      </button>
      <button
        onClick={() => onChange("banners")}
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
          activeTab === "banners"
            ? "bg-background text-foreground shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Megaphone size={14} />
        {language === "ar" ? "إرسال البنرات" : "Send Banners"}
      </button>
    </div>
  );
}
