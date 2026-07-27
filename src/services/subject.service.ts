import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
  onSnapshot,
  Unsubscribe,
  limit as firestoreLimit,
  DocumentSnapshot,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api-client";
import { Subject, Resource } from "@/types";
import { errorLogger } from "@/lib/errorLogger";
import { toDate } from "@/lib/utils";
import { analyticsService } from "./analytics.service";

/**
 * Subject Service - Handles all subject and resource operations.
 * Centralizes Firestore logic and API interactions to maintain a clean UI layer.
 */
export class SubjectService {
  private static instance: SubjectService;

  private constructor() {}

  public static getInstance(): SubjectService {
    if (!SubjectService.instance) {
      SubjectService.instance = new SubjectService();
    }
    return SubjectService.instance;
  }

  /**
   * Transforms Firestore document data into a typed Subject object.
   * Ensures dates and IDs are properly formatted.
   */
  private transformSubject(snapshot: DocumentSnapshot<DocumentData>): Subject {
    const data = snapshot.data() || {};
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt ? toDate(data.createdAt) : data.createdAt,
      updatedAt: data.updatedAt ? toDate(data.updatedAt) : data.updatedAt,
    } as unknown as Subject;
  }

  /**
   * Transforms Firestore document data into a typed Resource object.
   */
  private transformResource(snapshot: DocumentSnapshot<DocumentData>): Resource {
    const data = snapshot.data() || {};
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt ? toDate(data.createdAt) : data.createdAt,
    } as unknown as Resource;
  }

  /**
   * Get all subjects with optional pagination
   */
  async getAll(options?: { limit?: number }): Promise<Subject[]> {
    if (!db) return [];
    try {
      const subjectsRef = collection(db, "subjects");
      const q = options?.limit
        ? query(subjectsRef, orderBy("orderIndex"), firestoreLimit(options.limit))
        : query(subjectsRef, orderBy("orderIndex"));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.transformSubject(doc));
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.getAll", options });
      return [];
    }
  }

  /**
   * Subscribe to all subjects with optional filtering
   */
  getSubjects(
    onUpdate: (subjects: Subject[]) => void,
    onError?: (error: Error) => void,
    options?: { year?: string; limit?: number }
  ): Unsubscribe {
    if (!db) return () => {};
    const constraints: QueryConstraint[] = [];
    if (options?.year && options.year !== "All") {
      constraints.push(where("year", "==", options.year));
    }
    constraints.push(orderBy("orderIndex"));
    if (options?.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    const q = query(collection(db, "subjects"), ...constraints);
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => this.transformSubject(doc));
        onUpdate(data);
      },
      (error) => {
        errorLogger.capture(error, { context: "SubjectService.getSubjects", options });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Subscribe to a single subject by ID (real-time stream)
   */
  subscribeToSubject(
    id: string,
    onUpdate: (subject: Subject | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db || !id) return () => {};
    return onSnapshot(
      doc(db, "subjects", id),
      (snapshot) => {
        onUpdate(snapshot.exists() ? this.transformSubject(snapshot) : null);
      },
      (error) => {
        errorLogger.capture(error, { context: "SubjectService.subscribeToSubject", id });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Get subject by ID
   */
  async getById(id: string): Promise<Subject | null> {
    if (!db) return null;
    try {
      const docSnap = await getDoc(doc(db, "subjects", id));
      return docSnap.exists() ? this.transformSubject(docSnap) : null;
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.getById", id });
      return null;
    }
  }

  /**
   * Get subject by Name (for URL slugs)
   */
  async getByName(name: string): Promise<Subject | null> {
    if (!db) return null;
    try {
      const q = query(collection(db, "subjects"), where("name", "==", decodeURIComponent(name)));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return this.transformSubject(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.getByName", name });
      return null;
    }
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    if (!db) return;
    try {
      await updateDoc(doc(db, "subjects", id), {
        views: increment(1),
      });
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.incrementViews", id });
    }
  }

  /**
   * Track resource file download and increment analytics counters
   */
  async trackFileDownload(
    userId: string,
    resourceId: string,
    subjectId: string,
    fileName?: string,
    fileUrl?: string
  ): Promise<void> {
    if (!db) return;
    try {
      // 1. Increment downloadCount on the subcollection resource doc if subjectId is provided
      if (subjectId && resourceId) {
        const resourceRef = doc(db, "subjects", subjectId, "resources", resourceId);
        await updateDoc(resourceRef, {
          downloadCount: increment(1),
          views: increment(1),
        }).catch(() => {
          // If subcollection doc doesn't exist, try top-level collection fallback silently
          if (!db) return;
          const topResourceRef = doc(db, "resources", resourceId);
          return updateDoc(topResourceRef, {
            downloadCount: increment(1),
            views: increment(1),
          });
        });
      }

      // 2. Log activity in Analytics Service
      if (userId) {
        await analyticsService.logFileOpen(
          userId,
          fileName || resourceId,
          fileUrl || `/subject/${subjectId}/resource/${resourceId}`,
          subjectId
        );
      }
    } catch (error) {
      errorLogger.capture(error, {
        context: "SubjectService.trackFileDownload",
        userId,
        resourceId,
        subjectId,
      });
    }
  }

  /**
   * Subscribe to resources for a subject
   */
  subscribeToResources(
    subjectId: string,
    onUpdate: (resources: Resource[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const q = query(collection(db, "subjects", subjectId, "resources"), orderBy("orderIndex"));
    return onSnapshot(
      q,
      (snapshot) => {
        const resources = snapshot.docs.map((d) => this.transformResource(d));
        onUpdate(resources);
      },
      (error) => {
        errorLogger.capture(error, { context: "SubjectService.subscribeToResources", subjectId });
        if (onError) onError(error);
      }
    );
  }

  // Admin / Write operations

  async create(data: Omit<Subject, "id" | "createdAt">): Promise<string> {
    try {
      const response = await apiFetch<{ id: string }>("/api/admin/subjects", {
        method: "POST",
        body: data,
      });
      return response.id;
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.create", data });
      throw error;
    }
  }

  async update(id: string, data: Partial<Subject>): Promise<void> {
    try {
      await apiFetch(`/api/admin/subjects/${id}`, {
        method: "PATCH",
        body: data,
      });
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.update", id });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.delete", id });
      throw error;
    }
  }

  // ── Resource CRUD ──────────────────────────────────────────

  /**
   * Add a resource to a subject
   */
  async addResource(
    subjectId: string,
    data: Omit<Resource, "id" | "createdAt" | "subjectId">
  ): Promise<string> {
    try {
      const response = await apiFetch<{ id: string }>("/api/admin/resources", {
        method: "POST",
        body: {
          ...data,
          subjectId,
        },
      });
      return response.id;
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.addResource", subjectId, data });
      throw error;
    }
  }

  /**
   * Update a resource
   */
  async updateResource(
    subjectId: string,
    resourceId: string,
    data: Partial<Omit<Resource, "id" | "subjectId" | "createdAt">>
  ): Promise<void> {
    try {
      await apiFetch(`/api/admin/resources/${resourceId}`, {
        method: "PATCH",
        body: {
          ...data,
          subjectId,
        },
      });
    } catch (error) {
      errorLogger.capture(error, {
        context: "SubjectService.updateResource",
        subjectId,
        resourceId,
      });
      throw error;
    }
  }

  /**
   * Delete a resource
   */
  async deleteResource(subjectId: string, resourceId: string): Promise<void> {
    try {
      await apiFetch(
        `/api/admin/resources/${resourceId}?subjectId=${encodeURIComponent(subjectId)}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      errorLogger.capture(error, {
        context: "SubjectService.deleteResource",
        subjectId,
        resourceId,
      });
      throw error;
    }
  }

  /**
   * Get all resources for a subject (one-time fetch)
   */
  async getResources(subjectId: string): Promise<Resource[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, "subjects", subjectId, "resources"), orderBy("orderIndex"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => this.transformResource(d));
    } catch (error) {
      errorLogger.capture(error, { context: "SubjectService.getResources", subjectId });
      return [];
    }
  }
}

export const subjectService = SubjectService.getInstance();
