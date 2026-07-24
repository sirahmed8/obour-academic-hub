import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  DocumentSnapshot,
  FirestoreError,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { errorLogger } from "@/lib/errorLogger";

/**
 * Service to handle Authentication related Firestore operations.
 * Allows decoupling UI logic (AuthContext) from direct Firestore SDK calls.
 */
class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Transforms Firestore document data into a typed User object.
   */
  private transformUser(
    doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
  ): User {
    const data = doc.data()!;
    return {
      ...data,
      uid: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      lastLogin: data.lastLogin?.toDate?.() || data.lastLogin,
    } as User;
  }

  /**
   * Listen to user profile changes
   */
  subscribeToUserProfile(
    uid: string,
    onNext: (snapshot: DocumentSnapshot) => void,
    onError?: (error: FirestoreError) => void
  ): Unsubscribe {
    if (!db) {
      errorLogger.log("[authService] Firestore not initialized, skipping subscription", "warning");
      return () => {};
    }
    const userDocRef = doc(db, "users", uid);
    const errorHandler =
      onError ??
      ((error: FirestoreError) => {
        errorLogger.log("Error listening to user profile changes", "error", {
          uid,
          error: error.message,
        });
      });
    return onSnapshot(userDocRef, onNext, errorHandler);
  }

  /**
   * Check if an email is in the whitelist (for Admin promotion)
   */
  async checkWhitelist(email: string): Promise<boolean> {
    if (!db) return false;
    try {
      const whitelistDoc = await getDoc(doc(db, "whitelisted_admins", email));
      return whitelistDoc.exists();
    } catch (e) {
      errorLogger.capture(e, { context: "Whitelist check", email });
      return false;
    }
  }

  /**
   * Add an email to the whitelist (Invite Admin)
   */
  async addToWhitelist(email: string, invitedBy: string): Promise<void> {
    if (!db) return;
    await setDoc(doc(db, "whitelisted_admins", email), {
      email,
      invitedBy,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Get current user profile
   */
  async getUserProfile(uid: string): Promise<User | null> {
    if (!db) return null;
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? this.transformUser(docSnap) : null;
  }

  /**
   * Update an existing user profile
   */
  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    if (!db) return;
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
  }
}

export const authService = AuthService.getInstance();
