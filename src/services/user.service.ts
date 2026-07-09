import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  setDoc,
  onSnapshot,
  Unsubscribe,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api-client";
import { User } from "@/types";
import { errorLogger } from "@/lib/errorLogger";

/**
 * User Service - Handles all user-related Firestore operations and admin API calls.
 */
class UserService {
  /**
   * Transforms Firestore document data into a typed User object.
   */
  private transformUser(doc: QueryDocumentSnapshot<DocumentData>): User {
    const data = doc.data();
    return {
      ...data,
      uid: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      lastLogin: data.lastLogin?.toDate?.() || data.lastLogin,
    } as User;
  }

  /**
   * Get a single user by ID
   */
  async getById(uid: string): Promise<User | null> {
    if (!db) return null;
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? this.transformUser(userDoc) : null;
  }

  /**
   * Subscribe to all users (for Admin Dashboard)
   */
  subscribeToAll(
    limitCount: number,
    onUpdate: (users: User[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const q = query(collection(db, "users"), firestoreLimit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((d) => this.transformUser(d));
        onUpdate(users);
      },
      onError
    );
  }

  /**
   * Get all users with optional filters (One-time fetch)
   */
  async getAll(options?: {
    role?: string;
    limit?: number;
    orderByField?: string;
  }): Promise<User[]> {
    if (!db) return [];
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
    return snapshot.docs.map((doc) => this.transformUser(doc));
  }

  /**
   * Update user data
   */
  async update(uid: string, data: Partial<User>): Promise<void> {
    await apiFetch(`/api/admin/users/${uid}`, {
      method: "PATCH",
      body: data,
    });
  }

  /**
   * Create or update user
   */
  async upsert(uid: string, data: Partial<User>): Promise<void> {
    if (!db) return;
    await setDoc(doc(db, "users", uid), data, { merge: true });
  }

  /**
   * Mark a resource as completed, awarding points
   */
  async completeResource(uid: string, resourceId: string): Promise<void> {
    if (!db) return;
    await setDoc(
      doc(db, "users", uid),
      {
        completedResources: arrayUnion(resourceId),
        points: increment(25), // 25 points for completing a resource
      },
      { merge: true }
    );
  }

  /**
   * Promote user to admin and send notification
   */
  async promoteToAdmin(uid: string, email: string): Promise<void> {
    await apiFetch(`/api/admin/users/${uid}`, {
      method: "PATCH",
      body: {
        role: "admin",
      },
    });

    // Mock Email Notification
    errorLogger.log(`[Email Service] Sending 'You are now an Admin' email to ${email}`, "info");
  }

  /**
   * Delete user
   */
  async delete(uid: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, "users", uid));
  }
}

export const userService = new UserService();
