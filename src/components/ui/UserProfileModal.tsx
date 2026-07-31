"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts";
import {
  X,
  Flame,
  Zap,
  BookOpen,
  Swords,
  Award,
  GraduationCap,
  Building2,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublicProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  studentCode?: string;
  academicYear?: string;
  department?: string;
  institute?: string;
  points: number;
  streakDays: number;
  resourceCount: number;
  battleWins: number;
  role?: string;
  createdAt?: unknown;
}

interface UserProfileModalProps {
  uid: string | null;
  onClose: () => void;
}

const LEAGUES = [
  {
    name: "Diamond",
    color: "text-cyan-300",
    bg: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/30",
    min: 5000,
    emoji: "💎",
  },
  {
    name: "Gold",
    color: "text-amber-400",
    bg: "from-amber-500/20 to-yellow-500/10",
    border: "border-amber-500/30",
    min: 2000,
    emoji: "🥇",
  },
  {
    name: "Silver",
    color: "text-slate-300",
    bg: "from-slate-400/20 to-slate-600/10",
    border: "border-slate-400/30",
    min: 1000,
    emoji: "🥈",
  },
  {
    name: "Bronze",
    color: "text-orange-400",
    bg: "from-orange-600/20 to-amber-600/10",
    border: "border-orange-500/30",
    min: 0,
    emoji: "🥉",
  },
];

function getLeague(points: number) {
  return LEAGUES.find((l) => points >= l.min) ?? LEAGUES[LEAGUES.length - 1];
}

function StatBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 bg-card/40 rounded-2xl border border-border/30">
      <Icon className={cn("w-4 h-4", color)} />
      <p className="text-lg font-black text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

export function UserProfileModal({ uid, onClose }: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firestore = db;
    if (!uid || !firestore) return;
    setLoading(true);
    const fetch = async () => {
      try {
        const ref = doc(firestore, "users", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            uid: snap.id,
            displayName: d.displayName || d.email || "Unknown",
            email: d.email,
            photoURL: d.photoURL,
            studentCode: d.studentCode,
            academicYear: d.academicYear,
            department: d.department,
            institute: d.institute,
            points: d.points ?? 0,
            streakDays: d.streakDays ?? 0,
            resourceCount: d.resourceCount ?? 0,
            battleWins: d.battleWins ?? 0,
            role: d.role,
            createdAt: d.createdAt,
          });
        }
      } catch (err) {
        console.error("UserProfileModal fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [uid]);

  if (!uid) return null;

  const league = profile ? getLeague(profile.points) : null;
  const isSelf = profile?.uid === currentUser?.uid;
  const initials =
    profile?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <AnimatePresence>
      {uid && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
              {/* League Banner */}
              {league && (
                <div
                  className={cn(
                    "h-24 relative bg-gradient-to-br flex items-end px-5 pb-3",
                    league.bg,
                    "border-b",
                    league.border
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_70%)]" />
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/80 hover:bg-black/40 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-2xl">{league.emoji}</span>
                    <span className={cn("text-sm font-black", league.color)}>
                      {league.name} League
                    </span>
                    {isSelf && (
                      <span className="text-[10px] font-black text-primary bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
                        You
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Close button if no league loaded yet */}
              {!league && (
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-5">
                {loading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-muted/50 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted/50 rounded-lg animate-pulse w-2/3" />
                        <div className="h-3 bg-muted/30 rounded-lg animate-pulse w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : !profile ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Profile not found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {profile.photoURL ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={profile.photoURL}
                            alt={profile.displayName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-black text-lg">
                            {initials}
                          </div>
                        )}
                        {/* Online indicator */}
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-foreground truncate">
                          {profile.displayName}
                        </h2>
                        {profile.studentCode && (
                          <p className="text-xs text-muted-foreground font-medium">
                            ID: {profile.studentCode}
                          </p>
                        )}
                        {profile.role === "admin" && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Award className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Academic Info */}
                    <div className="grid grid-cols-1 gap-2">
                      {profile.institute && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{profile.institute}</span>
                        </div>
                      )}
                      {profile.department && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {profile.department}
                            {profile.academicYear ? ` • ${profile.academicYear}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      <StatBadge
                        icon={Zap}
                        label="XP"
                        value={profile.points.toLocaleString()}
                        color="text-purple-400"
                      />
                      <StatBadge
                        icon={Flame}
                        label="Streak"
                        value={`${profile.streakDays}d`}
                        color="text-orange-400"
                      />
                      <StatBadge
                        icon={BookOpen}
                        label="Files"
                        value={profile.resourceCount}
                        color="text-emerald-400"
                      />
                      <StatBadge
                        icon={Swords}
                        label="Wins"
                        value={profile.battleWins}
                        color="text-blue-400"
                      />
                    </div>

                    {/* XP Progress bar to next league */}
                    {(() => {
                      const currentLeague = getLeague(profile.points);
                      const leagueIdx = LEAGUES.findIndex((l) => l.name === currentLeague.name);
                      const nextLeague = LEAGUES[leagueIdx - 1];
                      if (!nextLeague) return null;
                      const progress = Math.min(
                        ((profile.points - currentLeague.min) /
                          (nextLeague.min - currentLeague.min)) *
                          100,
                        100
                      );
                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>
                              {currentLeague.emoji} {currentLeague.name}
                            </span>
                            <span>
                              {profile.points.toLocaleString()} / {nextLeague.min.toLocaleString()}{" "}
                              XP → {nextLeague.emoji} {nextLeague.name}
                            </span>
                          </div>
                          <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r",
                                nextLeague.name === "Diamond"
                                  ? "from-cyan-500 to-blue-500"
                                  : nextLeague.name === "Gold"
                                    ? "from-amber-500 to-yellow-400"
                                    : "from-slate-400 to-slate-300"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
