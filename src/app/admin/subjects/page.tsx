"use client";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { SubjectFormModal } from "./_components/SubjectFormModal";
import { SubjectsGrid } from "./_components/SubjectsGrid";
import { SubjectsHeader } from "./_components/SubjectsHeader";
import { useAdminSubjects } from "./useAdminSubjects";

export default function AdminSubjectsPage() {
  const subjectsPage = useAdminSubjects();

  return (
    <>
      <div className="mx-auto min-h-screen max-w-[1600px] space-y-8 p-6 lg:p-8">
        <SubjectsHeader
          language={subjectsPage.language}
          onAdd={() => subjectsPage.setIsFormOpen(true)}
          onSearchChange={subjectsPage.setSearchQuery}
          onSearchClear={() => subjectsPage.setSearchQuery("")}
          searchQuery={subjectsPage.searchQuery}
        />

        <SubjectsGrid
          language={subjectsPage.language}
          loading={subjectsPage.loading}
          onAdd={() => subjectsPage.setIsFormOpen(true)}
          onDelete={subjectsPage.setDeleteId}
          onEdit={subjectsPage.startEdit}
          searchQuery={subjectsPage.searchQuery}
          subjects={subjectsPage.filteredSubjects}
        />
      </div>

      <SubjectFormModal
        editingId={subjectsPage.editingId}
        errors={subjectsPage.errors}
        formData={subjectsPage.formData}
        isOpen={subjectsPage.isFormOpen}
        language={subjectsPage.language}
        onClose={subjectsPage.closeForm}
        onFieldKeyDown={subjectsPage.handleFieldKeyDown}
        onSubmit={subjectsPage.handleSubmit}
        setFormData={subjectsPage.setFormData}
      />

      <ConfirmationModal
        isOpen={!!subjectsPage.deleteId}
        onClose={() => subjectsPage.setDeleteId(null)}
        onConfirm={subjectsPage.handleDelete}
        title={subjectsPage.language === "ar" ? "حذف المادة" : "Delete Subject"}
        message={
          subjectsPage.language === "ar"
            ? "هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this subject? This action cannot be undone."
        }
        confirmText={subjectsPage.language === "ar" ? "حذف" : "Delete"}
        cancelText={subjectsPage.language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </>
  );
}
