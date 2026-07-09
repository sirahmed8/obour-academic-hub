"use client";

import { AnimatePresence } from "framer-motion";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ChatbotFloatingButton } from "./chatbot/ChatbotFloatingButton";
import { useAIChatbot } from "./chatbot/useAIChatbot";
import dynamic from "next/dynamic";

import React from "react";

const ChatbotPanel = dynamic(
  () => import("./chatbot/ChatbotPanel").then((mod) => mod.ChatbotPanel),
  { ssr: false }
);

export function AIChatbot() {
  const chatbot = useAIChatbot();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !chatbot.user || !chatbot.chatbotEnabled) {
    return null;
  }

  return (
    <>
      <ConfirmationModal
        isOpen={chatbot.showClearConfirm}
        onClose={() => chatbot.setShowClearConfirm(false)}
        onConfirm={chatbot.confirmClearChat}
        title={chatbot.language === "ar" ? "مسح المحادثة" : "Clear Chat History"}
        message={
          chatbot.language === "ar"
            ? "هل أنت متأكد أنك تريد مسح جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to clear all messages? This action cannot be undone."
        }
        confirmText={chatbot.language === "ar" ? "مسح" : "Clear"}
        cancelText={chatbot.language === "ar" ? "إلغاء" : "Cancel"}
      />

      <ChatbotFloatingButton
        isBtnHovered={chatbot.isBtnHovered}
        isOpen={chatbot.isOpen}
        isSolid={chatbot.isSolid}
        language={chatbot.language}
        onMouseEnter={() => chatbot.setIsBtnHovered(true)}
        onMouseLeave={() => chatbot.setIsBtnHovered(false)}
        onToggle={chatbot.toggleChat}
        unreadCount={chatbot.unreadCount}
      />

      <AnimatePresence>
        {chatbot.isOpen && (
          <ChatbotPanel
            handleDeleteMessage={chatbot.handleDeleteMessage}
            handleReaction={chatbot.handleReaction}
            handleSend={chatbot.handleSend}
            input={chatbot.input}
            isGenerating={chatbot.isGenerating}
            isSolid={chatbot.isSolid}
            language={chatbot.language}
            messages={chatbot.messages}
            mode={chatbot.mode}
            onClearChat={() => chatbot.setShowClearConfirm(true)}
            onClose={() => chatbot.setIsOpen(false)}
            replyTo={chatbot.replyTo}
            setInput={chatbot.setInput}
            setReplyTo={chatbot.setReplyTo}
            setMode={chatbot.setMode}
            aiEnabled={chatbot.aiEnabled}
            unreadCount={chatbot.unreadCount}
            user={chatbot.user}
          />
        )}
      </AnimatePresence>
    </>
  );
}
