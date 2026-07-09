import fs from "fs";
import path from "path";

const saPath = process.argv[2];

if (!saPath) {
  console.error("Usage: node scripts/fix-sa.mjs <path-to-service-account.json>");
  process.exit(1);
}

try {
  const absolutePath = path.resolve(saPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw);

  // Minimize JSON to a single line
  const minimized = JSON.stringify(parsed);

  console.log("\n✅ Successfully minimized Service Account JSON.");
  console.log("\n--- COPY THE LINE BELOW ---");
  console.log(minimized);
  console.log("--- END OF COPY ---\n");
  console.log("Paste the above line into your GitHub Secret: FIREBASE_SERVICE_ACCOUNT\n");
} catch (error) {
  console.error("❌ Failed to process JSON:", error.message);
  process.exit(1);
}
