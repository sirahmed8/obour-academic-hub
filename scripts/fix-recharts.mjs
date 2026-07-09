import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
  "src/components/features/StudentStats.tsx",
  "src/app/admin/analytics/_components/UserRolesChart.tsx",
  "src/app/admin/analytics/_components/UserGrowthChart.tsx",
  "src/app/admin/analytics/_components/SubjectViewsChart.tsx",
  "src/app/admin/analytics/_components/ResourceTypeChart.tsx",
  "src/app/admin/analytics/_components/ResourceDownloadsChart.tsx",
];

for (const relPath of filesToUpdate) {
  const filePath = path.join(__dirname, "..", relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${relPath}, not found`);
    continue;
  }
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;
  content = content.replace(/<ResponsiveContainer[^>]*width="100%"[^>]*>/g, (match) => {
    return match.replace(/width="100%"/, 'width="99%"');
  });
  content = content.replace(
    /<ResponsiveContainer\s*\n\s*width="100%"/g,
    '<ResponsiveContainer\n                width="99%"'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated ${relPath}`);
  } else {
    console.log(`No 100% found in ${relPath} or already 99%`);
  }
}
