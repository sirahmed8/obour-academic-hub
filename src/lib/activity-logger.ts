import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type LogAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "SUBJECT_CREATE"
  | "SUBJECT_UPDATE"
  | "SUBJECT_DELETE"
  | "RESOURCE_CREATE"
  | "RESOURCE_DELETE"
  | "BANNER_CREATE"
  | "BANNER_DELETE"
  | "USER_ROLE_CHANGE"
  | "NOTIFICATION_SEND"
  | "ERROR";

interface LogEntry {
  action: LogAction;
  details: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
}

export async function createLog(entry: LogEntry): Promise<void> {
  try {
    await addDoc(collection(db, "logs"), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
}

// Convenience functions
export const logLogin = (userId: string, email: string) =>
  createLog({
    action: "USER_LOGIN",
    details: `User logged in: ${email}`,
    userId,
    userEmail: email,
  });

export const logLogout = (userId: string, email: string) =>
  createLog({
    action: "USER_LOGOUT",
    details: `User logged out: ${email}`,
    userId,
    userEmail: email,
  });

export const logSubjectCreate = (userId: string, email: string, subjectName: string) =>
  createLog({
    action: "SUBJECT_CREATE",
    details: `Created subject: ${subjectName}`,
    userId,
    userEmail: email,
  });

export const logResourceCreate = (
  userId: string,
  email: string,
  resourceName: string,
  subjectName: string
) =>
  createLog({
    action: "RESOURCE_CREATE",
    details: `Added resource "${resourceName}" to ${subjectName}`,
    userId,
    userEmail: email,
  });

export const logRoleChange = (adminEmail: string, targetEmail: string, newRole: string) =>
  createLog({
    action: "USER_ROLE_CHANGE",
    details: `${adminEmail} changed ${targetEmail} role to ${newRole}`,
    userEmail: adminEmail,
  });

export const logError = (error: string, userId?: string, email?: string) =>
  createLog({ action: "ERROR", details: error, userId, userEmail: email });
