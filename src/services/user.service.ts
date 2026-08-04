import { apiFetch } from "@/lib/api-client";
import { errorLogger } from "@/lib/errorLogger";
import { db } from "@/lib/firebase";
import {
  calculateGPA,
  calculateStudyStreak,
  CourseGradeInput,
  DateInput,
  toDate,
} from "@/lib/utils";
import { User } from "@/types";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  increment,
  limit as firestoreLimit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  where,
} from "firebase/firestore";

/**
 * User Service - Handles all user-related Firestore operations, calculations, and admin API calls.
 */
class UserService {
  /**
   * Transforms Firestore document data into a typed User object.
   */
  private transformUser(
    snapshot:
      | { id?: string; data?: () => DocumentData; exists?: () => boolean }
      | Record<string, unknown>
      | null
      | undefined
  ): User {
    if (!snapshot) return {} as User;
    const rawData = typeof snapshot.data === "function" ? snapshot.data() : snapshot;
    const data = (rawData || {}) as Record<string, unknown>;
    const id = snapshot.id || (data.uid as string | undefined) || (data.id as string | undefined);
    return {
      ...data,
      uid: id,
      createdAt: data.createdAt
        ? toDate(data.createdAt as Parameters<typeof toDate>[0])
        : data.createdAt,
      lastLogin: data.lastLogin
        ? toDate(data.lastLogin as Parameters<typeof toDate>[0])
        : data.lastLogin,
    } as User;
  }

  /**
   * Get a single user by ID
   */
  async getById(uid: string): Promise<User | null> {
    if (!db) return null;
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? this.transformUser(userDoc) : null;
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.getById", uid });
      return null;
    }
  }

  /**
   * Check if a username is available (unique across all users)
   */
  async checkUsernameAvailable(rawUsername: string, excludeUid?: string): Promise<boolean> {
    if (!db || !rawUsername.trim()) return false;
    const cleanHandle = rawUsername.trim().toLowerCase().replace(/^@/, "");
    if (cleanHandle.length < 3 || cleanHandle.length > 20) return false;
    if (!/^[a-z0-9_]+$/.test(cleanHandle)) return false;

    try {
      const q = query(collection(db, "users"), where("username", "==", cleanHandle));
      const snap = await getDocs(q);
      if (snap.empty) return true;
      if (excludeUid && snap.docs.length === 1 && snap.docs[0].id === excludeUid) {
        return true;
      }
      return false;
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.checkUsernameAvailable", rawUsername });
      return false;
    }
  }

  /**
   * Get a user profile by unique username handle
   */
  async getByUsername(rawUsername: string): Promise<User | null> {
    if (!db || !rawUsername.trim()) return null;
    const cleanHandle = rawUsername.trim().toLowerCase().replace(/^@/, "");
    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", cleanHandle),
        firestoreLimit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return this.transformUser(snap.docs[0]);
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.getByUsername", rawUsername });
      return null;
    }
  }

  /**
   * Subscribe to a single user by ID (real-time stream)
   */
  subscribeToUser(
    uid: string,
    onUpdate: (user: User | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db || !uid) return () => {};
    return onSnapshot(
      doc(db, "users", uid),
      (snapshot) => {
        onUpdate(snapshot.exists() ? this.transformUser(snapshot) : null);
      },
      (error) => {
        errorLogger.capture(error, { context: "UserService.subscribeToUser", uid });
        if (onError) onError(error);
      }
    );
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
      (error) => {
        errorLogger.capture(error, { context: "UserService.subscribeToAll" });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Processes leaderboard users with precise tie-breaking logic and explicit rank positions.
   */
  private processLeaderboard(rawUsers: User[]): User[] {
    // Tie-breaking: 1. Points (desc), 2. Completed Resources count (desc), 3. Display Name (asc)
    const sorted = [...rawUsers].sort((a, b) => {
      const pA = a.points || 0;
      const pB = b.points || 0;
      if (pB !== pA) return pB - pA;

      const rA = Array.isArray(a.completedResources) ? a.completedResources.length : 0;
      const rB = Array.isArray(b.completedResources) ? b.completedResources.length : 0;
      if (rB !== rA) return rB - rA;

      return (a.displayName || "").localeCompare(b.displayName || "");
    });

    return sorted.map((u, index) => ({
      ...u,
      rank: index + 1,
    }));
  }

  /**
   * Subscribe to leaderboard (top users by points, real-time with rank computation)
   */
  subscribeToLeaderboard(
    limitCount: number = 20,
    onUpdate: (users: User[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const q = query(collection(db, "users"), orderBy("points", "desc"), firestoreLimit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((d) => this.transformUser(d));
        const rankedUsers = this.processLeaderboard(users);
        onUpdate(rankedUsers);
      },
      (error) => {
        errorLogger.capture(error, { context: "UserService.subscribeToLeaderboard" });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Get leaderboard rankings (One-time fetch with tie-breaking and rank numbers)
   */
  async getLeaderboard(limitCount: number = 20): Promise<User[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, "users"),
        orderBy("points", "desc"),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((d) => this.transformUser(d));
      return this.processLeaderboard(users);
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.getLeaderboard", limitCount });
      return [];
    }
  }

  /**
   * Calculates student GPA accurately and updates user document in Firestore.
   */
  async calculateAndUpdateGPA(uid: string, courses: CourseGradeInput[]): Promise<number> {
    const gpa = calculateGPA(courses);
    if (!db || !uid) return gpa;

    try {
      await setDoc(doc(db, "users", uid), { gpa, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.calculateAndUpdateGPA", uid, courses });
    }

    return gpa;
  }

  /**
   * Updates student study streak logic based on daily activity.
   */
  async updateStudyStreak(
    uid: string,
    lastActiveDate?: DateInput,
    currentStreak: number = 0
  ): Promise<number> {
    const { streak, updated } = calculateStudyStreak(lastActiveDate, currentStreak);

    if (!db || !uid || !updated) return streak;

    try {
      await setDoc(
        doc(db, "users", uid),
        { streak, lastActive: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.updateStudyStreak", uid });
    }

    return streak;
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
    try {
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
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.getAll", options });
      return [];
    }
  }

  /**
   * Update user data
   */
  async update(uid: string, data: Partial<User>): Promise<void> {
    try {
      await apiFetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        body: data,
      });
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.update", uid });
      throw error;
    }
  }

  /**
   * Create or update user
   */
  async upsert(uid: string, data: Partial<User>): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, "users", uid), data, { merge: true });
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.upsert", uid });
      throw error;
    }
  }

  /**
   * Alias for updating user profile data directly in Firestore
   */
  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    return this.upsert(uid, data);
  }

  /**
   * Centralized Gamification Engine: Awards XP & Points to a user with VIP Pass 2x multiplier support.
   */
  async awardUserXP(
    uid: string,
    amount: number,
    reason: string = "general_activity"
  ): Promise<{ finalXP: number; isVip: boolean; multiplier: number }> {
    if (!db || !uid || amount <= 0) {
      return { finalXP: amount, isVip: false, multiplier: 1 };
    }

    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const isVip = Boolean(
        userData.isVip ||
        userData.role === "owner" ||
        userData.role === "admin" ||
        userData.subscriptionTier === "vip"
      );
      const multiplier = isVip ? 2 : 1;
      const finalXP = amount * multiplier;

      await setDoc(
        doc(db, "users", uid),
        {
          xp: increment(finalXP),
          points: increment(finalXP),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { finalXP, isVip, multiplier };
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.awardUserXP", uid, amount, reason });
      return { finalXP: amount, isVip: false, multiplier: 1 };
    }
  }

  /**
   * Mark a resource as completed, awarding points
   */
  async completeResource(uid: string, resourceId: string): Promise<void> {
    if (!db) return;
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          completedResources: arrayUnion(resourceId),
          points: increment(25),
        },
        { merge: true }
      );
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.completeResource", uid, resourceId });
      throw error;
    }
  }

  /**
   * Promote user to admin and send notification
   */
  async promoteToAdmin(uid: string, email: string): Promise<void> {
    try {
      await apiFetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        body: {
          role: "admin",
        },
      });

      errorLogger.log(`[Email Service] Sending 'You are now an Admin' email to ${email}`, "info");
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.promoteToAdmin", uid, email });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(uid: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (error) {
      errorLogger.capture(error, { context: "UserService.delete", uid });
      throw error;
    }
  }
}

export const userService = new UserService();
