"use client";

import { useState, useEffect } from "react";
import { getSystemStats, SystemStats } from "@/actions/system";
import { useLanguage } from "@/contexts";
import { ScaleIn } from "@/components/ui/Animations";
import { Cpu, HardDrive, Server, Activity, Clock } from "lucide-react";
import { formatFileSize, cn } from "@/lib/utils";

export function SystemStatus() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const fetchStats = async () => {
    try {
      const data = await getSystemStats();
      setStats(data);
    } catch {
      console.error("Failed to load system stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center justify-center p-8 bg-muted/20 rounded-2xl border border-border">
        <Activity className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <ScaleIn className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Server className="text-primary w-6 h-6" />
        <h2 className="text-xl font-bold">{language === "ar" ? "حالة النظام" : "System Status"}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="p-4 bg-muted/30 rounded-2xl border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">CPU</span>
          </div>
          <p className="font-bold text-foreground text-sm truncate" title={stats.cpu.brand}>
            {stats.cpu.brand}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{stats.cpu.cores} Cores</span>
            <span
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                stats.cpu.load > 80
                  ? "bg-red-500/10 text-red-500"
                  : "bg-green-500/10 text-green-500"
              )}
            >
              {stats.cpu.load.toFixed(1)}% Load
            </span>
          </div>
        </div>

        {/* Memory */}
        <div className="p-4 bg-muted/30 rounded-2xl border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Memory</span>
          </div>
          <p className="font-bold text-foreground">
            {formatFileSize(stats.mem.used)}{" "}
            <span className="text-muted-foreground font-normal">
              / {formatFileSize(stats.mem.total)}
            </span>
          </p>
          <div className="w-full bg-muted mt-3 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.mem.used / stats.mem.total) * 100}%` }}
            />
          </div>
        </div>

        {/* OS */}
        <div className="p-4 bg-muted/30 rounded-2xl border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">OS</span>
          </div>
          <p className="font-bold text-foreground capitalize">
            {stats.os.platform} {stats.os.distro}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {stats.os.release} ({stats.os.arch})
          </p>
        </div>

        {/* Uptime */}
        <div className="p-4 bg-muted/30 rounded-2xl border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Uptime</span>
          </div>
          <p className="font-bold text-foreground">
            {Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m
          </p>
          <p className="text-xs text-muted-foreground mt-1">Running Smoothly</p>
        </div>
      </div>
    </ScaleIn>
  );
}
