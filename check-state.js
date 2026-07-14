const fs = require("fs");
const path = require("path");

function walk(dir, depth = 0) {
  if (depth > 3) return [];
  let files = [];
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        files = files.concat(walk(full, depth + 1));
      } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
        files.push(full);
      }
    }
  } catch (e) {}
  return files;
}

console.log("=== Files written (TS/TSX) ===");
const allFiles = walk("src");
allFiles.sort();
allFiles.forEach(f => console.log(f));
console.log("\nTotal:", allFiles.length);

// Check specific key files
const keyFiles = [
  "src/convex/adminAuth.ts",
  "src/convex/schema.ts",
  "src/pages/Admin.tsx",
  "src/pages/Landing.tsx",
  "src/main.tsx",
  "src/components/admin/AdminSidebar.tsx",
  "src/components/admin/panels/AdminDashboard.tsx",
  "src/components/admin/panels/AdminProducts.tsx",
  "src/lib/weightUnits.ts",
  "src/vite-env.d.ts",
];

console.log("\n=== Key file check ===");
keyFiles.forEach(f => {
  const exists = fs.existsSync(f);
  const size = exists ? fs.statSync(f).size : 0;
  console.log(`${exists ? "OK" : "MISSING"} ${f} (${size}b)`);
});
