/**
 * Firestore Backup Script (Node.js) - ESM Version
 * Fetches key collections and saves them to JSON.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize Firebase Admin
let saEnv = process.env.FIREBASE_BACKUP_SA;
if (!saEnv) {
  console.error("FIREBASE_SERVICE_ACCOUNT not found");
  process.exit(1);
}

// Remove potential Vercel/GitHub double quotes
saEnv = saEnv.trim();
if (saEnv.startsWith('"') && saEnv.endsWith('"')) {
  saEnv = saEnv.substring(1, saEnv.length - 1);
}

// Attempt base64 decode if it doesn't look like JSON
if (!saEnv.startsWith("{") && !saEnv.includes("\n") && saEnv.length > 100) {
  try {
    const decoded = Buffer.from(saEnv, "base64").toString("utf-8").trim();
    if (decoded.startsWith("{")) {
      saEnv = decoded;
    }
  } catch (err) {
    console.error("Base64 decode failed:", err.message);
  }
}

// Extract JSON safely
const jsonStart = saEnv.indexOf("{");
const jsonEnd = saEnv.lastIndexOf("}");
if (jsonStart !== -1 && jsonEnd !== -1) {
  saEnv = saEnv.substring(jsonStart, jsonEnd + 1);
}

let serviceAccount;
try {
  // Clean potential unescaped control characters
  const sanitizedJson = saEnv.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
  serviceAccount = JSON.parse(sanitizedJson);

  // Normalize private key explicitly since process.env strings sometimes escape newlines differently
  if (serviceAccount.privateKey) {
    serviceAccount.private_key = serviceAccount.privateKey;
  }

  if (serviceAccount.private_key) {
    let pk = serviceAccount.private_key;
    pk = pk.replace(/\\\\n/g, "\n");
    pk = pk.replace(/\\n/g, "\n");
    pk = pk.replace(/^"|"$/g, "").trim();

    if (!pk.includes("-----BEGIN PRIVATE KEY-----")) {
      pk = `-----BEGIN PRIVATE KEY-----\n${pk}\n-----END PRIVATE KEY-----`;
    }

    pk = pk.replace(/-----BEGIN PRIVATE KEY-----([^\n])/, "-----BEGIN PRIVATE KEY-----\n$1");
    pk = pk.replace(/([^\n])-----END PRIVATE KEY-----/, "$1\n-----END PRIVATE KEY-----");
    pk = pk.replace(/\n\s*\n/g, "\n");

    serviceAccount.private_key = pk;
  }
} catch (error) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", error.message);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const COLLECTIONS = ["subjects", "resources", "users", "whitelisted_admins", "settings"];

async function runBackup() {
  console.log("Starting Firestore Backup (ESM)...");
  const backupData = {};

  for (const collectionName of COLLECTIONS) {
    console.log(`Backing up collection: ${collectionName}...`);
    try {
      const snapshot = await db.collection(collectionName).get();
      backupData[collectionName] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      console.error(`Error backing up ${collectionName}:`, err.message);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(__dirname, "../backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filePath = path.join(backupDir, `backup-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

  console.log(`Backup completed successfully: ${filePath}`);
}

runBackup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
