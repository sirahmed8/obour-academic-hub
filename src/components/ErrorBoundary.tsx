"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  mounted: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, mounted: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, mounted: true };
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use centralized error logger
    Promise.all([import("@/lib/errorLogger"), import("@/lib/firebase")]).then(
      ([{ errorLogger }, { auth, db }]) => {
        const user = auth?.currentUser;
        const context = {
          componentStack: errorInfo.componentStack,
          userId: user?.uid,
          email: user?.email || undefined,
        };

        errorLogger.log(error, "critical", context);

        // Log to Firestore (System Errors) - Only if DB is available
        if (db) {
          import("firebase/firestore")
            .then(({ collection, addDoc, serverTimestamp }) => {
              addDoc(collection(db, "system_errors"), {
                message: error.message,
                stack: error.stack,
                ...context,
                userAgent: navigator.userAgent,
                timestamp: serverTimestamp(),
                url: window.location.href,
              }).catch(() => {});
            })
            .catch(() => {});
        }
      }
    );
  }

  render() {
    if (this.state.hasError) {
      const isAr =
        this.state.mounted &&
        typeof document !== "undefined" &&
        document.documentElement.lang === "ar";

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

          <div className="relative z-10 w-full max-w-md p-8 mx-4">
            <div className="bg-card/40 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  {isAr ? "حدث خطأ غير متوقع" : "Oops! Something broke"}
                </h1>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {isAr
                    ? "لقد تم إرسال تقرير للمطورين وسنعمل على حل المشكلة في أقرب وقت."
                    : "A technical report has been dispatched to our developers. We're on it!"}
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 mt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  {isAr ? "إعادة تحميل الصفحة" : "Reload Experience"}
                </button>

                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full h-14 bg-muted text-foreground font-bold rounded-2xl hover:bg-muted/80 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {isAr ? "العودة للرئيسية" : "Return Home"}
                </button>
              </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground/30 font-medium text-center uppercase tracking-widest italic">
              Obour Academic Hub • Secure Error Shield
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
