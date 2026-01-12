"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use centralized error logger
    Promise.all([import("@/lib/errorLogger"), import("@/lib/firebase")]).then(
      ([{ errorLogger }, { auth, db }]) => {
        const user = auth.currentUser;
        const context = {
          componentStack: errorInfo.componentStack,
          userId: user?.uid,
          email: user?.email || undefined,
        };

        errorLogger.log(error, "critical", context);

        // Log to Firestore (System Errors)
        import("firebase/firestore").then(({ collection, addDoc, serverTimestamp }) => {
          addDoc(collection(db, "system_errors"), {
            message: error.message,
            stack: error.stack,
            ...context,
            userAgent: navigator.userAgent,
            timestamp: serverTimestamp(),
            url: window.location.href,
          }).catch(() => {});
        });
      }
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            We&apos;ve been notified and are looking into it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
