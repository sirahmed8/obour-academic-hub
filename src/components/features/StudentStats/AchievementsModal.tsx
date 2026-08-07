import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Award } from "lucide-react";

export interface Achievement {
  title: string;
  desc: string;
  unlocked: boolean;
  icon: string;
}

interface AchievementsModalProps {
  show: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedCount: number;
  language: string;
}

export function AchievementsModal({
  show,
  onClose,
  achievements,
  unlockedCount,
  language,
}: AchievementsModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-h-[85vh] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-[500px] md:max-h-[80vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Trophy size={22} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    {language === "ar" ? "الإنجازات" : "Achievements"}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {unlockedCount}/{achievements.length} {language === "ar" ? "مفتوح" : "unlocked"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[65vh] p-4 space-y-3">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    achievement.unlocked
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/20 border-border/30 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      achievement.unlocked ? "bg-primary/10 shadow-lg" : "bg-muted/30 grayscale"
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold ${
                        achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {achievement.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{achievement.desc}</p>
                  </div>
                  {achievement.unlocked && (
                    <div className="shrink-0 p-1.5 bg-primary rounded-lg">
                      <Award size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
