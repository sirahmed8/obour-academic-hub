"use client";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { getSubjectOptions } from "./resource-utils";
import { ResourceAddForm } from "./_components/ResourceAddForm";
import { ResourceDragOverlay } from "./_components/ResourceDragOverlay";
import { ResourceHeader } from "./_components/ResourceHeader";
import { ResourceList } from "./_components/ResourceList";
import { ResourceSubjectSelect } from "./_components/ResourceSubjectSelect";
import { EditResourceModal } from "./_components/EditResourceModal";
import { useAdminResources } from "./useAdminResources";

export default function AdminResourcesPage() {
  const resourcesPage = useAdminResources();

  return (
    <>
      <ConfirmationModal
        isOpen={!!resourcesPage.deleteTarget}
        onClose={() => resourcesPage.setDeleteTarget(null)}
        onConfirm={resourcesPage.handleDelete}
        title={resourcesPage.language === "ar" ? "حذف المورد" : "Delete Resource"}
        message={
          resourcesPage.language === "ar"
            ? "هل أنت متأكد أنك تريد حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this resource? This action cannot be undone."
        }
        confirmText={resourcesPage.language === "ar" ? "حذف" : "Delete"}
        cancelText={resourcesPage.language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />

      <div
        className="relative min-h-screen w-full p-6 page-transition lg:p-10"
        onPaste={resourcesPage.handlePaste}
        onDragOver={resourcesPage.handleDragOver}
        onDragLeave={resourcesPage.handleDragLeave}
        onDrop={resourcesPage.handleDrop}
      >
        <ResourceDragOverlay
          isDragging={resourcesPage.isDragging}
          language={resourcesPage.language}
        />

        <ResourceHeader language={resourcesPage.language} />

        <ResourceSubjectSelect
          language={resourcesPage.language}
          loading={resourcesPage.loadingSubjects}
          onChange={(subjectId) => resourcesPage.setForm((prev) => ({ ...prev, subjectId }))}
          options={getSubjectOptions(resourcesPage.subjects, resourcesPage.language)}
          value={resourcesPage.form.subjectId}
        />

        <div className="flex flex-col gap-8 w-full">
          <ResourceAddForm
            form={resourcesPage.form}
            language={resourcesPage.language}
            onMainFileSelect={resourcesPage.handleMainFileSelection}
            onSubmit={resourcesPage.handleSubmit}
            setForm={resourcesPage.setForm}
            uploading={resourcesPage.uploading}
          />

          <ResourceList
            language={resourcesPage.language}
            loadingResources={resourcesPage.loadingResources}
            onDelete={(resource) =>
              resourcesPage.setDeleteTarget({
                resourceId: resource.id,
                subjectId: resourcesPage.form.subjectId,
              })
            }
            onEdit={resourcesPage.openEditModal}
            resources={resourcesPage.resources}
            selectedSubjectId={resourcesPage.form.subjectId}
          />
        </div>
      </div>

      <EditResourceModal
        editForm={resourcesPage.editForm}
        editUploading={resourcesPage.editUploading}
        isOpen={!!resourcesPage.editingResource}
        language={resourcesPage.language}
        onClose={() => resourcesPage.setEditingResource(null)}
        onSubmit={resourcesPage.handleEditSubmit}
        setEditForm={resourcesPage.setEditForm}
      />
    </>
  );
}
