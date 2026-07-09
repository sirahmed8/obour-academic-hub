"use client";

import {
  Dispatch,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { subjectService } from "@/services/subject.service";
import { Subject } from "@/types";
import { INITIAL_SUBJECT_FORM } from "./subject-utils";
import { SubjectBoundaryHit, SubjectFormData, SubjectFormErrors } from "./types";

export interface AdminSubjectsController {
  closeForm: () => void;
  deleteId: string | null;
  editingId: string | null;
  errors: SubjectFormErrors;
  filteredSubjects: Subject[];
  formData: SubjectFormData;
  handleDelete: () => Promise<void>;
  handleFieldKeyDown: (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isFormOpen: boolean;
  language: string;
  loading: boolean;
  searchQuery: string;
  setDeleteId: Dispatch<SetStateAction<string | null>>;
  setFormData: Dispatch<SetStateAction<SubjectFormData>>;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  subjects: Subject[];
  startEdit: (subject: Subject) => void;
}

export function useAdminSubjects(): AdminSubjectsController {
  const { language } = useLanguage();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<SubjectFormData>(INITIAL_SUBJECT_FORM);
  const [errors, setErrors] = useState<SubjectFormErrors>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const lastBoundaryHit = useRef<SubjectBoundaryHit | null>(null);

  useEffect(() => {
    if (!db) return;
    const subjectsQuery = query(collection(db, "subjects"), orderBy("orderIndex"));
    const unsubscribe = onSnapshot(subjectsQuery, (snapshot) => {
      setSubjects(
        snapshot.docs.map(
          (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Subject
        )
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFormOpen) {
        closeForm();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFormOpen]);

  const validateForm = () => {
    const nextErrors: SubjectFormErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = language === "ar" ? "مطلوب" : "Required";
    }
    if (!formData.profName.trim()) {
      nextErrors.profName = language === "ar" ? "مطلوب" : "Required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(INITIAL_SUBJECT_FORM);
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await subjectService.update(editingId, formData);
        toast.success(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await subjectService.create({
          ...formData,
          orderIndex: subjects.length,
        });
        toast.success(language === "ar" ? "تم إنشاء المادة" : "Subject created");
      }

      closeForm();
    } catch {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      nameAr: subject.nameAr || "",
      profName: subject.profName,
      profNameAr: subject.profNameAr || "",
      description: subject.description || "",
      descriptionAr: subject.descriptionAr || "",
      icon: subject.icon,
      color: subject.color,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await subjectService.delete(deleteId);
      toast.success(language === "ar" ? "تم الحذف" : "Deleted");
    } catch {
      toast.error(language === "ar" ? "فشل الحذف" : "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleFieldKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { key, currentTarget } = event;
    const input = currentTarget;
    const isTextarea = input.tagName === "TEXTAREA";
    const isRTL = input.dir === "rtl";

    let atRightEdge = false;
    let atLeftEdge = false;
    let atTopEdge = false;
    let atBottomEdge = false;

    if (isRTL) {
      atRightEdge = input.selectionStart === 0 && input.selectionEnd === 0;
      atLeftEdge =
        input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
    } else {
      atRightEdge =
        input.selectionEnd === input.value.length && input.selectionStart === input.value.length;
      atLeftEdge = input.selectionStart === 0 && input.selectionEnd === 0;
    }

    if (isTextarea) {
      atTopEdge = input.selectionStart === 0;
      atBottomEdge = input.selectionEnd === input.value.length;
    }

    let shouldMove = false;

    if (
      lastBoundaryHit.current &&
      (lastBoundaryHit.current.fieldId !== input.id || lastBoundaryHit.current.key !== key)
    ) {
      lastBoundaryHit.current = null;
    }

    const checkDoubleTap = () => {
      const now = Date.now();
      if (lastBoundaryHit.current && now - lastBoundaryHit.current.time < 1000 && !event.repeat) {
        shouldMove = true;
        lastBoundaryHit.current = null;
      } else if (!event.repeat) {
        lastBoundaryHit.current = { fieldId: input.id, key, time: now };
      }
    };

    if (key === "ArrowRight") {
      if (atRightEdge) {
        checkDoubleTap();
      } else {
        lastBoundaryHit.current = null;
      }
    } else if (key === "ArrowLeft") {
      if (atLeftEdge) {
        checkDoubleTap();
      } else {
        lastBoundaryHit.current = null;
      }
    } else if (key === "ArrowDown") {
      if (!isTextarea) {
        shouldMove = true;
      } else if (atBottomEdge) {
        checkDoubleTap();
      } else {
        lastBoundaryHit.current = null;
      }
    } else if (key === "ArrowUp") {
      if (!isTextarea) {
        shouldMove = true;
      } else if (atTopEdge) {
        checkDoubleTap();
      } else {
        lastBoundaryHit.current = null;
      }
    }

    if (!shouldMove) {
      return;
    }

    const fields = [
      "field-name",
      "field-profName",
      "field-nameAr",
      "field-profNameAr",
      "field-description",
      "field-descriptionAr",
    ];
    const currentIndex = fields.indexOf(input.id);
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = -1;
    if (key === "ArrowDown") {
      if (currentIndex + 2 < fields.length) {
        nextIndex = currentIndex + 2;
      }
    } else if (key === "ArrowUp") {
      if (currentIndex - 2 >= 0) {
        nextIndex = currentIndex - 2;
      }
    } else if (key === "ArrowRight") {
      if (currentIndex < fields.length - 1) {
        nextIndex = currentIndex + 1;
      }
    } else if (key === "ArrowLeft") {
      if (currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }
    }

    if (nextIndex !== -1) {
      event.preventDefault();
      document.getElementById(fields[nextIndex])?.focus();
      lastBoundaryHit.current = null;
    }
  };

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          subject.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (subject.nameAr && subject.nameAr.includes(searchQuery))
      ),
    [searchQuery, subjects]
  );

  return {
    closeForm,
    deleteId,
    editingId,
    errors,
    filteredSubjects,
    formData,
    handleDelete,
    handleFieldKeyDown,
    handleSubmit,
    isFormOpen,
    language,
    loading,
    searchQuery,
    setDeleteId,
    setFormData,
    setIsFormOpen,
    setSearchQuery,
    subjects,
    startEdit,
  };
}
