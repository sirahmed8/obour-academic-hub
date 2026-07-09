import "server-only";

import { App, cert, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logServerError, logServerWarning } from "@/lib/server/error-sanitizer";
import { ApiError } from "@/lib/server/api-error";

type ServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

interface RawServiceAccount {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  client_email_id?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
}

function getServiceAccountConfig(): ServiceAccountConfig | null {
  // Try FIREBASE_SERVICE_ACCOUNT first, then fall back to SERVICE_ACCOUNT_KEY
  const saEnv = (process.env.FIREBASE_SERVICE_ACCOUNT || process.env.SERVICE_ACCOUNT_KEY)?.trim();

  if (!saEnv) {
    if (process.env.NODE_ENV === "production") {
      logServerWarning(
        "[FIREBASE-ADMIN] CRITICAL: FIREBASE_SERVICE_ACCOUNT is missing in production. Many features will fail."
      );
    }
    return null;
  }

  let cleanSaEnv = saEnv;

  // Handle potential Vercel double-quoting / escaping
  if (cleanSaEnv.startsWith('"') && cleanSaEnv.endsWith('"')) {
    cleanSaEnv = cleanSaEnv.substring(1, cleanSaEnv.length - 1);
  }

  // If it looks like base64, decode it
  if (!cleanSaEnv.startsWith("{") && !cleanSaEnv.includes("\n") && cleanSaEnv.length > 100) {
    try {
      console.log("[FIREBASE-ADMIN] Found potential Base64. Attempting decode...");
      const decoded = Buffer.from(cleanSaEnv, "base64").toString("utf-8").trim();
      if (decoded.startsWith("{")) {
        cleanSaEnv = decoded;
        console.log("[FIREBASE-ADMIN] Base64 decode successful");
      }
    } catch (e) {
      logServerError("[FIREBASE-ADMIN] Base64 decode failed", e);
    }
  }

  // Final sanitization for JSON
  const jsonStart = cleanSaEnv.indexOf("{");
  const jsonEnd = cleanSaEnv.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanSaEnv = cleanSaEnv.substring(jsonStart, jsonEnd + 1);
  }

  if (cleanSaEnv.startsWith("{")) {
    try {
      // Fix potential unescaped control characters in JSON string
      const sanitizedJson = cleanSaEnv.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
      const raw = JSON.parse(sanitizedJson) as RawServiceAccount;

      const config: ServiceAccountConfig = {
        projectId: (raw.project_id || raw.projectId)!,
        clientEmail: (raw.client_email || raw.clientEmail || raw.client_email_id)!,
        privateKey: (raw.private_key || raw.privateKey)!,
      };

      if (!config.projectId || !config.clientEmail || !config.privateKey) {
        logServerError("[FIREBASE-ADMIN] Service account missing required fields", {
          hasProjectId: !!config.projectId,
          hasEmail: !!config.clientEmail,
          hasKey: !!config.privateKey,
          projectIdFound: config.projectId || "none",
        });
        return null;
      }

      // 🛡️ Hardened private key normalization
      let pk = config.privateKey;

      // Handle various escape sequences for newlines
      pk = pk.replace(/\\\\n/g, "\n");
      pk = pk.replace(/\\n/g, "\n");

      // Clean up any double quotes or extra whitespace
      pk = pk.replace(/^"|"$/g, "").trim();

      if (!pk.includes("-----BEGIN PRIVATE KEY-----")) {
        pk = `-----BEGIN PRIVATE KEY-----\n${pk}\n-----END PRIVATE KEY-----`;
      }

      // Ensure one newline after header and before footer
      pk = pk.replace(/-----BEGIN PRIVATE KEY-----([^\n])/, "-----BEGIN PRIVATE KEY-----\n$1");
      pk = pk.replace(/([^\n])-----END PRIVATE KEY-----/, "$1\n-----END PRIVATE KEY-----");

      // Ensure no double newlines within key content
      pk = pk.replace(/\n\s*\n/g, "\n");

      config.privateKey = pk;

      console.log("[FIREBASE-ADMIN] Successfully parsed service account for:", config.projectId);
      return config;
    } catch (e) {
      logServerError("[FIREBASE-ADMIN] JSON parse failed. Raw length: " + saEnv.length, e);
      return null;
    }
  } else {
    logServerError(
      "[FIREBASE-ADMIN] Config does not look like JSON. Starts with: " + cleanSaEnv.substring(0, 20)
    );
  }
  return null;
}

// Firebase Admin app instance manager
export const getAdminApp = (): App => {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const config = getServiceAccountConfig();

  // High-reliability Project ID resolution
  const projectId =
    config?.projectId ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "obourinstitutes1";

  try {
    if (config) {
      return initializeApp({
        credential: cert(config as ServiceAccount),
        projectId,
        databaseURL:
          process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });
    }

    // Fallback for limited functionality (unauthenticated)
    if (process.env.NODE_ENV === "production") {
      logServerWarning("[FIREBASE-ADMIN] Initializing fallback app without credentials", {
        projectId,
      });
    }
    return initializeApp({ projectId });
  } catch (error) {
    logServerError("[FIREBASE-ADMIN] App Initialization failed", error, {
      projectId,
      hasConfig: !!config,
    });
    // Final emergency fallback
    const currentApps = getApps();
    if (currentApps.length > 0) return currentApps[0];
    return initializeApp({ projectId: "obourinstitutes1" }, "fallback-" + Date.now());
  }
};

export const getAdminAuth = () => getAuth(getAdminApp());

export const getAdminDb = () => {
  const db = getFirestore(getAdminApp());
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Ignore already initialized settings
  }
  return db;
};

export const getAdminStorage = () => getStorage(getAdminApp());

// Backwards compatibility for other routes with robust error handling
function createLazyService<T extends object>(name: string, initFn: () => T | null): T {
  let instance: T | null = null;
  let initialized = false;

  const getService = () => {
    if (!initialized) {
      try {
        instance = initFn();
      } catch (e) {
        logServerError(`[FIREBASE-ADMIN] Failed to initialize service: ${name}`, e);
        instance = null;
      }
      initialized = true;
    }
    return instance;
  };

  const handler: ProxyHandler<T> = {
    get(_, prop, receiver) {
      const service = getService();
      if (!service) {
        // 🚨 CRITICAL: Instead of returning undefined, we throw a 503 error
        // to prevent "TypeError: ... is not a function" in API routes.
        const errorMessage = `Firebase service "${name}" is unavailable. Check server logs for initialization errors.`;
        throw new ApiError(503, errorMessage);
      }

      try {
        const value = Reflect.get(service, prop, receiver);
        return typeof value === "function" ? value.bind(service) : value;
      } catch (e) {
        logServerError(`[FIREBASE-ADMIN] Error accessing property ${String(prop)} on ${name}`, e);
        throw new ApiError(500, `Internal Server Error accessing ${name}`);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apply(target: T, thisArg: any, argArray: any[]) {
      const service = getService();
      if (!service || typeof service !== "function") {
        throw new Error(`Firebase service ${name} is not available or not a function`);
      }
      return Reflect.apply(
        service as unknown as (...args: unknown[]) => unknown,
        thisArg,
        argArray
      );
    },
  };
  return new Proxy({} as T, handler);
}

export const adminApp = createLazyService("App", () => getAdminApp());
export const adminAuth = createLazyService("Auth", () => getAdminAuth());
export const adminDb = createLazyService("Firestore", () => getAdminDb());
export const adminStorage = createLazyService("Storage", () => getAdminStorage());

export { FieldValue, Timestamp };
