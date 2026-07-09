"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "../constants";
import { EditUserModalState } from "../types";

interface EditUserModalProps {
  editModal: EditUserModalState;
  language: string;
  onClose: () => void;
  onSave: () => Promise<void>;
  setEditModal: React.Dispatch<React.SetStateAction<EditUserModalState>>;
}

export function EditUserModal({
  editModal,
  language,
  onClose,
  onSave,
  setEditModal,
}: EditUserModalProps) {
  return (
    <AnimatePresence>
      {editModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Pencil className="h-5 w-5 text-primary" />
                {language === "ar" ? "تعديل بيانات المستخدم" : "Edit User"}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium">
                  {language === "ar" ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(event) =>
                    setEditModal((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
                  placeholder={language === "ar" ? "اسم المستخدم" : "User name"}
                />
              </div>

              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium">
                  {language === "ar" ? "كود الطالب" : "Student Code"}
                </label>
                <input
                  type="text"
                  value={editModal.code}
                  onChange={(event) => {
                    if (event.target.value.length <= 6) {
                      setEditModal((prev) => ({ ...prev, code: event.target.value }));
                    }
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono tracking-widest shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm font-bold text-foreground">
                  {language === "ar" ? "الصلاحيات" : "Permissions"}
                </p>
                <div className="custom-scrollbar grid max-h-[200px] grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
                  {PERMISSIONS.map((permission) => {
                    const isChecked = editModal.permissions.includes(permission.key);
                    return (
                      <label
                        key={permission.key}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all",
                          isChecked
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-transparent bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isChecked}
                            onChange={() => {
                              const nextPermissions = isChecked
                                ? editModal.permissions.filter((p) => p !== permission.key)
                                : [...editModal.permissions, permission.key];
                              setEditModal((prev) => ({
                                ...prev,
                                permissions: nextPermissions,
                              }));
                            }}
                          />
                          <div className="flex h-4 w-4 items-center justify-center rounded border border-input transition-colors peer-checked:border-primary peer-checked:bg-primary">
                            {isChecked && <div className="h-2 w-2 rounded-sm bg-white" />}
                          </div>
                        </div>
                        <span className="text-xs font-medium">
                          {language === "ar" ? permission.labelAr : permission.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border py-3 font-medium transition-colors hover:bg-muted"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={onSave}
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
                >
                  {language === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
