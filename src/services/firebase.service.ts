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
  limit as firestoreLimit,
  QueryConstraint,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Subject, Notification } from "@/types";

/**
 * User Service - Handles all user-related Firestore operations
 */
export const userService = {
  /**
   * Get a single user by ID
   */
  async getById(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  },

  /**
   * Get all users with optional filters
   */
  async getAll(options?: {
    role?: string;
    limit?: number;
    orderByField?: string;
  }): Promise<User[]> {
    const constraints: QueryConstraint[] = [];

    if (options?.role) {
      constraints.push(where("role", "==", options.role));
    }

    if (options?.orderByField) {
      constraints.push(orderBy(options.orderByField, "desc"));
    }

    if (options?.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    const q = query(collection(db, "users"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as User);
  },

  /**
   * Update user data
   */
  async update(uid: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, "users", uid), data);
  },

  /**
   * Create or update user
   */
  async upsert(uid: string, data: Partial<User>): Promise<void> {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  },

  /**
   * Delete user
   */
  async delete(uid: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid));
  },
};

/**
 * Subject Service - Handles all subject-related operations
 */
export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const snapshot = await getDocs(collection(db, "subjects"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Subject);
  },

  async getById(id: string): Promise<Subject | null> {
    const docSnap = await getDoc(doc(db, "subjects", id));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Subject) : null;
  },

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
  },
};

/**
 * Notification Service - Handles all notification operations
 */
export const notificationService = {
  async getForUser(userId: string, limitCount = 50): Promise<Notification[]> {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification);
  },

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    link?: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      read: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async markAsRead(id: string): Promise<void> {
    await updateDoc(doc(db, "notifications", id), { read: true });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "notifications", id));
  },
};
