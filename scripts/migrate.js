/* eslint-disable */
/**
 * Firebase Project Data Migration Script
 * Migrates Auth Users and Firestore Collections from obour-institutes-a607d to obourinstitutes1.
 *
 * Requirements:
 * 1. Old project service account is read from .env.local (FIREBASE_SERVICE_ACCOUNT).
 * 2. New project service account JSON file should be downloaded and placed at the root as 'new-service-account.json'.
 * 3. Run: node scripts/migrate.js
 */

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env.local
const envLocalPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const admin = require("firebase-admin");

const NEW_SA_PATH = path.join(__dirname, "..", "new-service-account.json");

async function run() {
  console.log("--- Starting Firebase Migration ---");

  // 1. Load old Firebase Admin App
  const OLD_SA_FILE_PATH = path.join(
    __dirname,
    "..",
    "obour-institutes-a607d-firebase-adminsdk-fbsvc-21d92a7999.json"
  );
  let oldServiceAccount;

  if (fs.existsSync(OLD_SA_FILE_PATH)) {
    try {
      oldServiceAccount = JSON.parse(fs.readFileSync(OLD_SA_FILE_PATH, "utf8"));
      console.log("Loaded old service account from file.");
    } catch (err) {
      console.error("Error: Failed to parse old service account JSON file.");
      process.exit(1);
    }
  } else {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error(
        "Error: FIREBASE_SERVICE_ACCOUNT is missing in .env.local and key file not found."
      );
      process.exit(1);
    }

    try {
      oldServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (oldServiceAccount.private_key) {
        oldServiceAccount.private_key = oldServiceAccount.private_key.replace(/\\n/g, "\n");
      }
      console.log("Loaded old service account from .env.local.");
    } catch (err) {
      console.error("Error: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON from .env.local.");
      process.exit(1);
    }
  }

  const oldApp = admin.initializeApp(
    {
      credential: admin.credential.cert(oldServiceAccount),
    },
    "old-app"
  );

  // 2. Load new Firebase Admin App
  if (!fs.existsSync(NEW_SA_PATH)) {
    console.warn("\n⚠️  new-service-account.json NOT found at the project root.");
    console.warn(
      "To migrate data, please download the service account JSON key for your new project:"
    );
    console.warn(
      "   Go to: Firebase Console -> Project Settings -> Service Accounts -> Generate new private key"
    );
    console.warn(`   Save it as: ${NEW_SA_PATH}\n`);
    console.warn(
      "Please provide this file, then run the script again to migrate Auth & Firestore data."
    );
    process.exit(0);
  }

  let newServiceAccount;
  try {
    newServiceAccount = JSON.parse(fs.readFileSync(NEW_SA_PATH, "utf8"));
  } catch (err) {
    console.error("Error: Failed to parse new-service-account.json.");
    process.exit(1);
  }

  const newApp = admin.initializeApp(
    {
      credential: admin.credential.cert(newServiceAccount),
    },
    "new-app"
  );

  const oldAuth = oldApp.auth();
  const newAuth = newApp.auth();
  const oldDb = oldApp.firestore();
  const newDb = newApp.firestore();

  // --- STEP 1: Migrate Authentication Users ---
  console.log("\n[1/3] Migrating Authentication Users...");
  const users = [];
  let nextPageToken = undefined;

  try {
    do {
      const listUsersResult = await oldAuth.listUsers(1000, nextPageToken);
      users.push(...listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`Found ${users.length} users to migrate.`);

    if (users.length > 0) {
      // Map user records to the structure required for import
      const userImportRecords = users.map((user) => {
        const importRecord = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          disabled: user.disabled,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
          providerData: user.providerData.map((p) => ({
            uid: p.uid,
            providerId: p.providerId,
            displayName: p.displayName,
            photoURL: p.photoURL,
            email: p.email,
          })),
        };

        // Add password hash details if available
        if (user.passwordHash) {
          importRecord.passwordHash = Buffer.from(user.passwordHash, "base64");
        }
        if (user.passwordSalt) {
          importRecord.passwordSalt = Buffer.from(user.passwordSalt, "base64");
        }

        return importRecord;
      });

      // Split into chunks of 1000 for import limits
      const chunkSize = 1000;
      for (let i = 0; i < userImportRecords.length; i += chunkSize) {
        const chunk = userImportRecords.slice(i, i + chunkSize);
        const importResult = await newAuth.importUsers(chunk, {
          hash: {
            algorithm: "SCRYPT",
          },
        });
        console.log(
          `Imported chunk ${i / chunkSize + 1}: ${importResult.successCount} succeeded, ${importResult.failureCount} failed.`
        );
        if (importResult.failureCount > 0) {
          console.warn(
            "Some failures occurred during user import:",
            importResult.errors.slice(0, 3)
          );
        }
      }
    }
  } catch (error) {
    console.error("Error migrating users:", error);
  }

  // --- STEP 2: Migrate Firestore Database ---
  console.log("\n[2/3] Migrating Firestore Collections...");

  const collections = [
    "users",
    "chats",
    "subjects",
    "global_chat",
    "notifications",
    "whitelisted_admins",
    "admin_approvals",
    "banners",
    "settings",
    "analytics_logs",
    "user_stats",
    "error_logs",
    "logs",
    "system_errors",
  ];

  const subcollectionsMap = {
    users: ["tasks"],
    chats: ["messages"],
    subjects: ["resources"],
  };

  for (const collectionName of collections) {
    console.log(`Migrating collection: "${collectionName}"...`);
    try {
      const snapshot = await oldDb.collection(collectionName).get();
      console.log(`  Found ${snapshot.size} documents.`);

      const batchSize = 400;
      let batch = newDb.batch();
      let count = 0;

      for (const doc of snapshot.docs) {
        const docRef = newDb.collection(collectionName).doc(doc.id);
        batch.set(docRef, doc.data());
        count++;

        if (count % batchSize === 0) {
          await batch.commit();
          batch = newDb.batch();
          console.log(`  Committed ${count} documents...`);
        }

        // Check for subcollections
        if (subcollectionsMap[collectionName]) {
          for (const subName of subcollectionsMap[collectionName]) {
            const subSnapshot = await oldDb
              .collection(collectionName)
              .doc(doc.id)
              .collection(subName)
              .get();
            if (subSnapshot.size > 0) {
              console.log(
                `    Migrating subcollection "${subName}" of "${collectionName}/${doc.id}" (${subSnapshot.size} docs)...`
              );
              let subBatch = newDb.batch();
              let subCount = 0;
              for (const subDoc of subSnapshot.docs) {
                const subDocRef = newDb
                  .collection(collectionName)
                  .doc(doc.id)
                  .collection(subName)
                  .doc(subDoc.id);
                subBatch.set(subDocRef, subDoc.data());
                subCount++;
                if (subCount % batchSize === 0) {
                  await subBatch.commit();
                  subBatch = newDb.batch();
                }
              }
              if (subCount % batchSize !== 0) {
                await subBatch.commit();
              }
            }
          }
        }
      }

      if (count % batchSize !== 0) {
        await batch.commit();
      }
      console.log(`  Finished collection "${collectionName}".`);
    } catch (error) {
      console.error(`Error migrating collection "${collectionName}":`, error);
    }
  }

  console.log("\n--- Migration Finished Successfully ---");
}

run().catch(console.error);
