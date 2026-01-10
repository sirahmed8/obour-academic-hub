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
    import("@/lib/errorLogger").then(({ errorLogger }) => {
      errorLogger.log(error, "critical", {
        componentStack: errorInfo.componentStack,
      });
    });

    // Log to Firestore (System Errors) - Kept as fallback/redundancy for critical UI crashes
    import("@/lib/firebase").then(({ db }) => {
      import("firebase/firestore").then(({ collection, addDoc, serverTimestamp }) => {
        addDoc(collection(db, "system_errors"), {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          timestamp: serverTimestamp(),
          url: window.location.href,
        }).catch(() => {}); // Silent fail on log error
      });
    });
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
