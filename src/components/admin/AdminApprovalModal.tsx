"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, BellRing, User } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { buttonVariants, GLASSMORPHIC } from "@/lib/ui-variants";

import Image from "next/image";
import { toast } from "sonner";

// Define the shape of an approval request
interface ApprovalRequest {
  id: string;
  type: "post" | "user_verification" | "resource";
  title: string;
  description: string;
  requesterName: string;
  requesterPhoto?: string;
  createdAt: unknown;
  status: "pending" | "approved" | "rejected";
  data?: Record<string, unknown>; // Extra data like post content or file URL
}

export function AdminApprovalModal() {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();

  const [currentRequest, setCurrentRequest] = useState<ApprovalRequest | null>(null);

  // Listen for pending requests
  useEffect(() => {
    if (!user || !isAdmin || !db) return;

    // Assuming a collection 'admin_approvals' exists for live requests
    const q = query(
      collection(db, "admin_approvals"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRequests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ApprovalRequest);

      // Automatically show the newest request if none is currently shown
      if (newRequests.length > 0 && !currentRequest) {
        setCurrentRequest(newRequests[0]);
      }
    });

    return () => unsubscribe();
  }, [user, isAdmin, currentRequest]);

  const handleAction = async (approved: boolean) => {
    if (!currentRequest) return;

    try {
      if (approved) {
        await apiFetch(`/api/admin/approvals/${currentRequest.id}`, {
          method: "PATCH",
          body: { status: "approved" },
        });
        toast.success(language === "ar" ? "تم القبول" : "Request Approved");

        // Execute actual logic here (e.g. move post to public collection)
        // For now, we just mark as approved in the requests collection
      } else {
        await apiFetch(`/api/admin/approvals/${currentRequest.id}`, {
          method: "PATCH",
          body: { status: "rejected" },
        });
        toast.info(language === "ar" ? "تم الرفض" : "Request Rejected");
      }

      // Close modal and clear current
      setCurrentRequest(null);
    } catch (error) {
      console.error("Approval action failed:", error);
      toast.error("Action failed");
    }
  };

  if (!currentRequest) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center pointer-events-none p-4 pb-8 sm:pb-4">
        {/* Backdrop - optional, maybe we want it non-blocking behind? 
            If valid "Live Modal that listens to live context", usually it IS blocking or semi-blocking.
            Let's make it non-blocking so admin can see context, but high z-index.
        */}

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "pointer-events-auto w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-2xl",
            GLASSMORPHIC
          )}
        >
          {/* Header */}
          <div className="bg-primary/10 p-4 flex items-center gap-3 border-b border-primary/5">
            <div className="p-2 bg-primary/20 rounded-full animate-pulse">
              <BellRing className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider">
                {language === "ar" ? "طلب جديد" : "New Request"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "يتطلب اتخاذ إجراء فوري" : "Requires immediate action"}
              </p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {currentRequest.requesterPhoto ? (
                  <Image
                    src={currentRequest.requesterPhoto}
                    alt="User"
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate">
                  {currentRequest.requesterName}
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground mb-2">
                  {currentRequest.type === "post"
                    ? language === "ar"
                      ? "منشور"
                      : "Post"
                    : "Request"}
                </span>
                <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded-lg italic">
                  &quot;{currentRequest.description || currentRequest.title}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-muted/30 flex gap-2">
            <button
              onClick={() => handleAction(false)}
              className={cn(buttonVariants({ variant: "destructive", size: "md" }), "flex-1 gap-2")}
            >
              <X size={18} />
              {language === "ar" ? "رفض" : "Reject"}
            </button>
            <button
              onClick={() => handleAction(true)}
              className={cn(buttonVariants({ variant: "primary", size: "md" }), "flex-1 gap-2")}
            >
              <Check size={18} />
              {language === "ar" ? "قبول" : "Accept"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
