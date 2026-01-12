import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  setDoc,
  onSnapshot,
  Unsubscribe,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";

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
   * Subscribe to all users (for Admin Dashboard)
   */
  subscribeToAll(
    limitCount: number,
    onUpdate: (users: User[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    let q;
    try {
      q = query(collection(db, "users"), orderBy("createdAt", "desc"), firestoreLimit(limitCount));
    } catch {
      // Fallback if index is missing (though should be there)
      q = query(collection(db, "users"), firestoreLimit(limitCount));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((d) => ({ ...d.data(), uid: d.id }) as User);
        onUpdate(users);
      },
      onError
    );
  },

  /**
   * Get all users with optional filters (One-time fetch)
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
   * Promote user to admin and send notification
   */
  async promoteToAdmin(uid: string, email: string): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
      role: "admin",
      permissions: ["manage_users", "manage_subjects"], // Default perms
    });

    // Mock Email Notification
    console.log(`[Email Service] Sending 'You are now an Admin' email to ${email}`);
    // In real app: call cloud function or API route
  },

  /**
   * Delete user
   */
  async delete(uid: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid));
  },
};
