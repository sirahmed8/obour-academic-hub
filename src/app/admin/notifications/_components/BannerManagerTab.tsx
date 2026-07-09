"use client";

import { useMemo, useState } from "react";
import { History, Megaphone, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api-client";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";
import { Banner, BannerDraft } from "../types";
import { BannerCard } from "./BannerCard";

interface BannerManagerTabProps {
  banners: Banner[];
  language: string;
}

const EMPTY_BANNER_FORM: BannerDraft = {
  textAr: "",
  textEn: "",
  type: "info",
  isActive: true,
};

export function BannerManagerTab({ banners, language }: BannerManagerTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [bannerForm, setBannerForm] = useState<BannerDraft>(EMPTY_BANNER_FORM);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; bannerId: string | null }>({
    isOpen: false,
    bannerId: null,
  });

  const activeBanners = useMemo(() => banners.filter((banner) => banner.isActive), [banners]);
  const historyBanners = useMemo(() => banners.filter((banner) => !banner.isActive), [banners]);

  const handleCreateBanner = async () => {
    if (!bannerForm.textAr || !bannerForm.textEn) {
      return;
    }

    try {
      await apiFetch("/api/admin/banners", {
        method: "POST",
        body: { ...bannerForm },
      });

      toast.success(language === "ar" ? "تم نشر الإعلان" : "Banner published");
      setIsAdding(false);
      setBannerForm(EMPTY_BANNER_FORM);
    } catch (error) {
      console.error(error);
      toast.error("Error creating banner");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await apiFetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      body: { isActive: !current },
    });
  };

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, bannerId: id });
  };

  const confirmDeleteBanner = async () => {
    if (!deleteModal.bannerId) {
      return;
    }

    await apiFetch(`/api/admin/banners/${deleteModal.bannerId}`, {
      method: "DELETE",
    });
    toast.success(language === "ar" ? "تم حذف الإعلان" : "Banner deleted");
    setDeleteModal({ isOpen: false, bannerId: null });
  };

  return (
    <>
      <FadeIn className="space-y-6">
        <FadeIn delay={0.1} className="flex justify-end">
          <button
            onClick={() => setIsAdding((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg"
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {language === "ar" ? "إعلان جديد" : "New Banner"}
          </button>
        </FadeIn>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isAdding ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mb-4 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text (Arabic)</label>
                <input
                  value={bannerForm.textAr}
                  onChange={(event) =>
                    setBannerForm((prev) => ({ ...prev, textAr: event.target.value }))
                  }
                  placeholder="نص الإعلان..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-right shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text (English)</label>
                <input
                  value={bannerForm.textEn}
                  onChange={(event) =>
                    setBannerForm((prev) => ({ ...prev, textEn: event.target.value }))
                  }
                  placeholder="Announcement text..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(["info", "warning", "success", "urgent"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBannerForm((prev) => ({ ...prev, type }))}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm capitalize transition-all",
                        bannerForm.type === type
                          ? "scale-105 border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end pt-2 sm:pt-0">
                <button
                  onClick={handleCreateBanner}
                  disabled={!bannerForm.textAr || !bannerForm.textEn}
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white shadow-md transition-all hover:bg-green-600 hover:shadow-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Megaphone size={18} />
                  {language === "ar" ? "نشر" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Megaphone className="h-5 w-5 text-green-500" />
            {language === "ar" ? "نشط حالياً" : "Active Now"}
          </h2>

          {activeBanners.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 py-8 text-center text-sm text-muted-foreground">
              {language === "ar" ? "لا توجد إعلانات نشطة" : "No active banners"}
            </div>
          ) : (
            <StaggerChildren className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeBanners.map((banner) => (
                  <ScaleIn key={banner.id} layout>
                    <BannerCard
                      banner={banner}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  </ScaleIn>
                ))}
              </AnimatePresence>
            </StaggerChildren>
          )}
        </div>

        <div className="space-y-4 border-t pt-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-muted-foreground">
            <History className="h-5 w-5" />
            {language === "ar" ? "السجل / غير نشط" : "History / Inactive"}
          </h2>

          {historyBanners.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 py-8 text-center text-sm text-muted-foreground">
              {language === "ar" ? "السجل فارغ" : "History is empty"}
            </div>
          ) : (
            <StaggerChildren className="space-y-3">
              <AnimatePresence mode="popLayout">
                {historyBanners.map((banner) => (
                  <ScaleIn key={banner.id} layout>
                    <BannerCard
                      banner={banner}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  </ScaleIn>
                ))}
              </AnimatePresence>
            </StaggerChildren>
          )}
        </div>
      </FadeIn>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: null })}
        onConfirm={confirmDeleteBanner}
        title={language === "ar" ? "حذف الإعلان" : "Delete Banner"}
        message={
          language === "ar"
            ? "هل أنت متأكد من حذف هذا الإعلان؟"
            : "Are you sure you want to delete this banner?"
        }
      />
    </>
  );
}
