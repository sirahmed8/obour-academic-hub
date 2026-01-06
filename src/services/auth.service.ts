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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";

/**
 * Service to handle Authentication related Firestore operations.
 * Allows decoupling UI logic (AuthContext) from direct Firestore SDK calls.
 */
export const authService = {
  /**
   * Listen to user profile changes
   */
  subscribeToUserProfile(
    uid: string,
    onNext: (snapshot: DocumentSnapshot) => void,
    onError: (error: FirestoreError) => void
  ): Unsubscribe {
    const userDocRef = doc(db, "users", uid);
    return onSnapshot(userDocRef, onNext, onError);
  },

  /**
   * Check if an email is in the whitelist (for Admin promotion)
   */
  async checkWhitelist(email: string): Promise<boolean> {
    try {
      const whitelistDoc = await getDoc(doc(db, "whitelisted_admins", email));
      return whitelistDoc.exists();
    } catch (e) {
      console.error("Whitelist check failed", e);
      return false;
    }
  },

  /**
   * Add an email to the whitelist (Invite Admin)
   */
  async addToWhitelist(email: string, invitedBy: string): Promise<void> {
    await setDoc(doc(db, "whitelisted_admins", email), {
      email,
      invitedBy,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Create a new user profile
   */
  async createUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
    await setDoc(doc(db, "users", uid), data);
  },

  /**
   * Update an existing user profile
   */
  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, "users", uid), data);
  },
};
