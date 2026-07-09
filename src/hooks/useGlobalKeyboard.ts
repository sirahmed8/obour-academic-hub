"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useGlobalKeyboard() {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Allow Escape to work even in input fields
      if (e.key === "Escape") {
        // Blur any focused input
        if (isInputField) {
          target.blur();
          return;
        }
      }

      // Skip other shortcuts if in input field
      if (isInputField) return;

      // Global Navigation Shortcuts
      // Alt + H - Go to Home/Main
      if (e.altKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/main");
        return;
      }

      // Alt + T - Go to Todo
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        router.push("/todo");
        return;
      }

      // Alt + S - Go to Subjects
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        router.push("/subject");
        return;
      }

      // Alt + C - Go to Chat/Inbox (admin)
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        router.push("/admin/inbox");
        return;
      }

      // / - Focus search (if available)
      if (e.key === "/" && !e.ctrlKey && !e.altKey) {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="بحث"]'
        );
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
        return;
      }

      // ? - Show keyboard shortcuts help
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        showKeyboardShortcutsHelp();
        return;
      }
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

function showKeyboardShortcutsHelp() {
  // Create a simple toast or modal showing shortcuts
  const shortcuts = [
    { keys: "Alt + H", description: "Go to Home" },
    { keys: "Alt + T", description: "Go to Todo" },
    { keys: "Alt + S", description: "Go to Subject Browser" },
    { keys: "Alt + C", description: "Go to Chat/Inbox" },
    { keys: "/", description: "Focus Search" },
    { keys: "Esc", description: "Close Modal / Blur Input" },
    { keys: "?", description: "Show This Help" },
  ];

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "keyboard-shortcuts-overlay";
  overlay.className =
    "fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4";
  overlay.style.animation = "fadeIn 0.2s ease-out";

  const content = document.createElement("div");
  content.className = "bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full p-6";
  content.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">⌨️ Keyboard Shortcuts</h2>
      <button id="close-shortcuts" class="p-2 hover:bg-muted rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="space-y-2">
      ${shortcuts
        .map(
          (s) => `
        <div class="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <span class="text-sm text-muted-foreground">${s.description}</span>
          <kbd class="px-2 py-1 bg-muted rounded text-xs font-mono font-bold">${s.keys}</kbd>
        </div>
      `
        )
        .join("")}
    </div>
    <p class="text-xs text-muted-foreground/60 mt-4 text-center">Press Esc to close</p>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Close handlers
  const closeOverlay = () => {
    overlay.style.animation = "fadeOut 0.15s ease-out";
    setTimeout(() => overlay.remove(), 150);
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  document.getElementById("close-shortcuts")?.addEventListener("click", closeOverlay);

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeOverlay();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

// Add fadeIn/fadeOut animations via style
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
