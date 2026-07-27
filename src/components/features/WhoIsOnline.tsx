"use client";

import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, off, DataSnapshot } from "firebase/database";
import { useAuth, useLanguage } from "@/contexts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserPresence } from "@/types";
import { StaggerChildren, ScaleIn } from "@/components/ui/Animations";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function WhoIsOnline() {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const { user: currentUser, isOwner, isAdmin, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!rtdb) return;

    const presenceRef = ref(rtdb, "presence");

    const handleValue = async (snapshot: DataSnapshot) => {
      const users: UserPresence[] = [];
      snapshot.forEach((child) => {
        const data = child.val() as UserPresence;
        if (data && data.status === "online") {
          users.push(data);
        }
      });

      // Enrich with real data from Firestore
      const enrichedUsers = await Promise.all(
        users.map(async (u) => {
          if (!db) return u;
          try {
            const userDoc = await getDoc(doc(db, "users", u.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                ...u,
                displayName: data.displayName || u.displayName,
                photoURL: data.photoURL || u.photoURL,
                email: data.email || u.email,
              };
            }
          } catch (e) {
            console.error("Failed to fetch user doc for WhoIsOnline", e);
          }
          return u;
        })
      );

      // Sort: current user first, then by name
      enrichedUsers.sort((a, b) => {
        if (a.uid === currentUser?.uid) return -1;
        if (b.uid === currentUser?.uid) return 1;
        return (a.displayName || "").localeCompare(b.displayName || "");
      });

      setOnlineUsers(enrichedUsers);
    };

    onValue(presenceRef, handleValue);

    return () => {
      off(presenceRef, "value", handleValue);
    };
  }, [currentUser?.uid, isAdmin]);

  if (loading || !currentUser || onlineUsers.length === 0) return null;

  // Owners see the full list below the count, Admins only see the count pill
  if (!isOwner) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold border border-green-500/20 w-fit">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        {onlineUsers.length} {t("dashboard.onlineCount")}
      </div>
    );
  }

  // Owners see the full list below the count
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="text-primary w-5 h-5" />
          {t("dashboard.whosOnline")}
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold border border-green-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {onlineUsers.length} {t("dashboard.onlineCount")}
        </div>
      </div>
      <StaggerChildren className="flex flex-wrap gap-3">
        {onlineUsers.map((u) => (
          <ScaleIn key={u.uid} className="group relative" title={`${u.displayName} (${u.email})`}>
            <div
              className={cn(
                "flex items-center gap-2 p-1.5 pr-4 rounded-2xl border transition-all duration-300 hover:scale-105",
                u.uid === currentUser?.uid
                  ? "bg-primary/10 border-primary/20 ring-2 ring-primary/15 shadow-md shadow-primary/5"
                  : "bg-card/70 backdrop-blur-xl border-border/80 hover:border-primary/40 hover:shadow-lg"
              )}
            >
              <div className="relative">
                {u.photoURL ? (
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                    <Image src={u.photoURL} alt={u.displayName} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black text-xs border border-primary/20 shadow-sm">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background shadow-sm animate-pulse" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground leading-none">
                  {u.uid === currentUser?.uid ? t("dashboard.you") : u.displayName.split(" ")[0]}
                </span>
                {u.currentPath && (
                  <span
                    className="text-[10px] text-muted-foreground mt-0.5 max-w-[150px] truncate leading-none"
                    title={u.currentPath}
                  >
                    {u.currentPath}
                  </span>
                )}
              </div>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
