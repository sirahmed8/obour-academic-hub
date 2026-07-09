"use client";

import { AlertCircle, Check, CheckCircle2, Clock, Megaphone, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBannerCreatedAt } from "../banner-utils";
import { Banner } from "../types";

interface BannerCardProps {
  banner: Banner;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
}

export function BannerCard({ banner, onDelete, onToggleActive }: BannerCardProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-xl border p-4 transition-all",
        banner.isActive
          ? "border-primary/20 bg-card/50 shadow-sm backdrop-blur-md hover:shadow-md"
          : "border-dashed bg-muted/30 opacity-70 hover:opacity-100"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "mt-1 shrink-0 rounded-full p-2",
            banner.type === "urgent"
              ? "bg-red-500/10 text-red-600"
              : banner.type === "success"
                ? "bg-green-500/10 text-green-600"
                : banner.type === "warning"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-blue-500/10 text-blue-600"
          )}
        >
          {banner.type === "urgent" ? (
            <AlertCircle size={20} />
          ) : banner.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <Megaphone size={20} />
          )}
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
                banner.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"
              )}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs capitalize text-muted-foreground">{banner.type}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} />
              {formatBannerCreatedAt(banner.createdAt)}
            </span>
          </div>
          <h3 className="text-right text-lg font-medium" dir="rtl">
            {banner.textAr}
          </h3>
          <p className="text-sm text-muted-foreground">{banner.textEn}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onToggleActive(banner.id, banner.isActive)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={banner.isActive ? "Deactivate" : "Activate"}
        >
          {banner.isActive ? <X size={18} /> : <Check size={18} />}
        </button>
        <button
          onClick={() => onDelete(banner.id)}
          className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
