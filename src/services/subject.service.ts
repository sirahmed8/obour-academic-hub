import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subject, Resource } from "@/types";

/**
 * Enhanced Subject Service - Handles all subject and resource operations
 */
export const subjectService = {
  /**
   * Get all subjects
   */
  async getAll(): Promise<Subject[]> {
    const snapshot = await getDocs(collection(db, "subjects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Subject);
  },

  /**
   * Get subject by ID
   */
  async getById(id: string): Promise<Subject | null> {
    const docSnap = await getDoc(doc(db, "subjects", id));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Subject) : null;
  },

  /**
   * Get subject by Name (for URL slugs)
   */
  async getByName(name: string): Promise<Subject | null> {
    const q = query(
      collection(db, "subjects"),
      where("name", "==", decodeURIComponent(name))
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Subject;
    }
    return null;
  },

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    await updateDoc(doc(db, "subjects", id), {
      views: increment(1),
    });
  },

  /**
   * Subscribe to resources for a subject
   */
  subscribeToResources(
    subjectId: string,
    onUpdate: (resources: Resource[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "subjects", subjectId, "resources"),
      orderBy("orderIndex")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const resources = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Resource);
        onUpdate(resources);
      },
      onError
    );
  },

  // Admin / Write operations

  async create(data: Omit<Subject, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "subjects"), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Subject>): Promise<void> {
    await updateDoc(doc(db, "subjects", id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "subjects", id));
  }
};
