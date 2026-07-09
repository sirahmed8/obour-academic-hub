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
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api-client";
import { Subject, Resource } from "@/types";

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
  private transformSubject(doc: QueryDocumentSnapshot<DocumentData>): Subject {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as unknown as Subject;
  }

  /**
   * Transforms Firestore document data into a typed Resource object.
   */
  private transformResource(doc: QueryDocumentSnapshot<DocumentData>): Resource {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    } as unknown as Resource;
  }

  /**
   * Get all subjects with optional pagination
   */
  async getAll(options?: { limit?: number }): Promise<Subject[]> {
    if (!db) return [];

    const subjectsRef = collection(db, "subjects");
    const q = options?.limit
      ? query(subjectsRef, orderBy("orderIndex"), firestoreLimit(options.limit))
      : query(subjectsRef, orderBy("orderIndex"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.transformSubject(doc));
  }

  /**
   * Subscribe to all subjects
   */
  getSubjects(onUpdate: (subjects: Subject[]) => void): Unsubscribe {
    if (!db) return () => {};
    const q = query(collection(db, "subjects"), orderBy("orderIndex"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => this.transformSubject(doc));
      onUpdate(data);
    });
  }

  /**
   * Get subject by ID
   */
  async getById(id: string): Promise<Subject | null> {
    if (!db) return null;
    const docSnap = await getDoc(doc(db, "subjects", id));
    return docSnap.exists() ? this.transformSubject(docSnap) : null;
  }

  /**
   * Get subject by Name (for URL slugs)
   */
  async getByName(name: string): Promise<Subject | null> {
    if (!db) return null;
    const q = query(collection(db, "subjects"), where("name", "==", decodeURIComponent(name)));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return this.transformSubject(querySnapshot.docs[0]);
    }
    return null;
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, "subjects", id), {
      views: increment(1),
    });
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
      onError
    );
  }

  // Admin / Write operations

  async create(data: Omit<Subject, "id" | "createdAt">): Promise<string> {
    const response = await apiFetch<{ id: string }>("/api/admin/subjects", {
      method: "POST",
      body: data,
    });
    return response.id;
  }

  async update(id: string, data: Partial<Subject>): Promise<void> {
    await apiFetch(`/api/admin/subjects/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  async delete(id: string): Promise<void> {
    await apiFetch(`/api/admin/subjects/${id}`, {
      method: "DELETE",
    });
  }

  // ── Resource CRUD ──────────────────────────────────────────

  /**
   * Add a resource to a subject
   */
  async addResource(
    subjectId: string,
    data: Omit<Resource, "id" | "createdAt" | "subjectId">
  ): Promise<string> {
    const response = await apiFetch<{ id: string }>("/api/admin/resources", {
      method: "POST",
      body: {
        ...data,
        subjectId,
      },
    });
    return response.id;
  }

  /**
   * Update a resource
   */
  async updateResource(
    subjectId: string,
    resourceId: string,
    data: Partial<Omit<Resource, "id" | "subjectId" | "createdAt">>
  ): Promise<void> {
    await apiFetch(`/api/admin/resources/${resourceId}`, {
      method: "PATCH",
      body: {
        ...data,
        subjectId,
      },
    });
  }

  /**
   * Delete a resource
   */
  async deleteResource(subjectId: string, resourceId: string): Promise<void> {
    await apiFetch(
      `/api/admin/resources/${resourceId}?subjectId=${encodeURIComponent(subjectId)}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Get all resources for a subject (one-time fetch)
   */
  async getResources(subjectId: string): Promise<Resource[]> {
    if (!db) return [];
    const q = query(collection(db, "subjects", subjectId, "resources"), orderBy("orderIndex"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => this.transformResource(d));
  }
}

export const subjectService = SubjectService.getInstance();
