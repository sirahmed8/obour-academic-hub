"use client";

import {
  ClipboardEvent,
  Dispatch,
  DragEvent,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { subjectService } from "@/services/subject.service";
import { Resource, Subject } from "@/types";
import { DeleteTarget, EditResourceFormState, ResourceFormState, ResourceType } from "./types";

const INITIAL_RESOURCE_FORM: ResourceFormState = {
  subjectId: "",
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  type: "pdf",
  linkUrl: "",
  displayAsFile: false,
  file: null,
  thumbnailFile: null,
  thumbnailUrl: "",
};

const INITIAL_EDIT_FORM: EditResourceFormState = {
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  type: "pdf",
  url: "",
  displayAsFile: false,
  thumbnailUrl: "",
  file: null,
};

export interface AdminResourcesController {
  deleteTarget: DeleteTarget | null;
  editForm: EditResourceFormState;
  editingResource: Resource | null;
  editUploading: boolean;
  form: ResourceFormState;
  handleDelete: () => Promise<void>;
  handleDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
  handleEditSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleMainFileSelection: (file: File) => void;
  handlePaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isDragging: boolean;
  language: string;
  loadingResources: boolean;
  loadingSubjects: boolean;
  openEditModal: (resource: Resource) => void;
  resources: Resource[];
  setDeleteTarget: Dispatch<SetStateAction<DeleteTarget | null>>;
  setEditForm: Dispatch<SetStateAction<EditResourceFormState>>;
  setEditingResource: Dispatch<SetStateAction<Resource | null>>;
  setForm: Dispatch<SetStateAction<ResourceFormState>>;
  subjects: Subject[];
  uploading: boolean;
}

export function useAdminResources(): AdminResourcesController {
  const { language } = useLanguage();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editForm, setEditForm] = useState<EditResourceFormState>(INITIAL_EDIT_FORM);
  const [editUploading, setEditUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [form, setForm] = useState<ResourceFormState>(INITIAL_RESOURCE_FORM);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!db) return;
    const subjectsQuery = query(collection(db, "subjects"), orderBy("name"));
    const unsubscribe = onSnapshot(subjectsQuery, (snapshot) => {
      const nextSubjects = snapshot.docs.map(
        (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Subject
      );

      setSubjects(nextSubjects);
      setLoadingSubjects(false);
      setForm((prev) => {
        if (nextSubjects.length > 0 && !prev.subjectId) {
          return { ...prev, subjectId: nextSubjects[0].id };
        }

        return prev;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!form.subjectId) {
      setResources([]);
      return;
    }

    setLoadingResources(true);
    const unsubscribe = subjectService.subscribeToResources(
      form.subjectId,
      (nextResources) => {
        setResources(nextResources);
        setLoadingResources(false);
      },
      (error) => {
        console.error("Error loading resources:", error);
        setLoadingResources(false);
      }
    );

    return () => unsubscribe();
  }, [form.subjectId]);

  useEffect(() => {
    if (!form.linkUrl) {
      return;
    }

    const lowerUrl = form.linkUrl.toLowerCase();
    if (lowerUrl.endsWith(".pdf")) {
      setForm((prev) => ({ ...prev, type: "pdf" }));
    } else if (
      lowerUrl.endsWith(".png") ||
      lowerUrl.endsWith(".jpg") ||
      lowerUrl.endsWith(".jpeg")
    ) {
      setForm((prev) => ({ ...prev, type: "image" }));
    } else if (lowerUrl.includes("youtube") || lowerUrl.endsWith(".mp4")) {
      setForm((prev) => ({ ...prev, type: "video" }));
    } else if (form.type === "pdf" && !lowerUrl.endsWith(".pdf")) {
      setForm((prev) => ({ ...prev, type: "link" }));
    }
  }, [form.linkUrl, form.type]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subjectId || !form.title) {
      toast.error(
        language === "ar"
          ? "يرجى ملء الحقول المطلوبة (العنوان والمادة)"
          : "Please fill required fields (Title & Subject)"
      );
      return;
    }

    if ((form.type === "link" || form.type === "video") && !form.linkUrl && !form.file) {
      toast.error(
        language === "ar" ? "يرجى إدخال الرابط أو رفع ملف" : "Please enter URL or upload a file"
      );
      return;
    }

    setUploading(true);

    try {
      let resourceUrl = form.linkUrl;
      let finalThumbnailUrl = form.thumbnailUrl;

      if (form.file) {
        const result = await uploadToCloudinary(form.file);
        resourceUrl = result.url;
        if (!finalThumbnailUrl && result.thumbnailUrl) {
          finalThumbnailUrl = result.thumbnailUrl;
        }
      }

      if (form.thumbnailFile) {
        const thumbnailResult = await uploadToCloudinary(form.thumbnailFile);
        finalThumbnailUrl = thumbnailResult.url;
      }

      await subjectService.addResource(form.subjectId, {
        title: form.title,
        titleAr: form.titleAr || form.title,
        description: form.description || "",
        descriptionAr: form.descriptionAr || form.description || "",
        type: form.type,
        url: resourceUrl,
        displayAsFile: form.displayAsFile,
        thumbnailUrl: finalThumbnailUrl || "",
        orderIndex: resources.length,
      });

      toast.success(language === "ar" ? "تم إضافة المورد" : "Resource added");
      setForm((prev) => ({
        ...prev,
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        linkUrl: "",
        displayAsFile: false,
        file: null,
        thumbnailFile: null,
        thumbnailUrl: "",
      }));
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        language === "ar"
          ? `فشلت العملية: ${(error as Error).message}`
          : `Operation failed: ${(error as Error).message}`
      );
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setEditForm({
      title: resource.title,
      titleAr: resource.titleAr || "",
      description: resource.description || "",
      descriptionAr: resource.descriptionAr || "",
      type: resource.type,
      url: resource.url,
      displayAsFile: resource.displayAsFile || false,
      thumbnailUrl: resource.thumbnailUrl || "",
      file: null,
    });
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingResource || !form.subjectId) {
      return;
    }

    setEditUploading(true);

    try {
      let finalUrl = editForm.url;
      let finalThumbnailUrl = editForm.thumbnailUrl;

      if (editForm.file) {
        const result = await uploadToCloudinary(editForm.file);
        finalUrl = result.url;
        if (!finalThumbnailUrl && result.thumbnailUrl) {
          finalThumbnailUrl = result.thumbnailUrl;
        }
      }

      await subjectService.updateResource(form.subjectId, editingResource.id, {
        title: editForm.title,
        titleAr: editForm.titleAr || editForm.title,
        description: editForm.description,
        descriptionAr: editForm.descriptionAr || editForm.description,
        type: editForm.type,
        url: finalUrl,
        displayAsFile: editForm.displayAsFile,
        thumbnailUrl: finalThumbnailUrl,
      });

      toast.success(language === "ar" ? "تم تحديث المورد" : "Resource updated");
      setEditingResource(null);
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    } finally {
      setEditUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await subjectService.deleteResource(deleteTarget.subjectId, deleteTarget.resourceId);
      toast.success(language === "ar" ? "تم حذف المورد" : "Resource deleted");
    } catch {
      toast.error(language === "ar" ? "فشل الحذف" : "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleMainFileSelection = (file: File) => {
    let detectedType: ResourceType = form.type;
    if (file.type.startsWith("image/")) {
      detectedType = "image";
    } else if (file.type === "application/pdf") {
      detectedType = "pdf";
    } else if (file.type.startsWith("video/")) {
      detectedType = "video";
    }

    setForm((prev) => ({ ...prev, file, type: detectedType }));
    toast.success(language === "ar" ? "تم اختيار الملف" : "File selected");
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.kind !== "file") {
        continue;
      }

      const file = item.getAsFile();
      if (file) {
        handleMainFileSelection(file);
        event.preventDefault();
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleMainFileSelection(file);
    }
  };

  return {
    deleteTarget,
    editForm,
    editingResource,
    editUploading,
    form,
    handleDelete,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleEditSubmit,
    handleMainFileSelection,
    handlePaste,
    handleSubmit,
    isDragging,
    language,
    loadingResources,
    loadingSubjects,
    openEditModal,
    resources,
    setDeleteTarget,
    setEditForm,
    setEditingResource,
    setForm,
    subjects,
    uploading,
  };
}
