import fs from "fs";
import path from "path";

const SRC = "/home/project/home/project/src";
const DST = "/home/project/src";

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      count += copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
      count++;
      if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
        console.log("Copied:", entry, stat.size + "b");
      }
    }
  }
  return count;
}

console.log("=== Copying recovered files ===");
if (!fs.existsSync(SRC)) {
  console.log("Source not found:", SRC);
} else {
  const count = copyDir(SRC, DST);
  console.log("Copied", count, "files total");
}

console.log("\n=== Project verification ===");
const check = [
  "package.json", "src/main.tsx", "src/index.css",
  "src/pages/Admin.tsx", "src/pages/Landing.tsx", "src/pages/Auth.tsx",
  "src/convex/schema.ts", "src/convex/adminAuth.ts", "src/convex/settings.ts",
  "src/convex/categories.ts", "src/convex/products.ts", "src/convex/dashboard.ts",
  "src/convex/migration.ts",
  "src/components/admin/AdminSidebar.tsx",
  "src/components/admin/panels/AdminDashboard.tsx",
  "src/components/admin/panels/AdminProducts.tsx",
  "src/components/admin/panels/AdminCategories.tsx",
  "src/components/admin/panels/AdminBranding.tsx",
  "src/components/admin/panels/AdminSettings.tsx",
  "src/components/admin/panels/AdminAccountSecurity.tsx",
  "src/components/admin/panels/AdminMigration.tsx",
  "src/lib/weightUnits.ts",
];

let ok = 0, missing = 0;
for (const f of check) {
  const full = path.join("/home/project", f);
  const exists = fs.existsSync(full);
  const size = exists ? fs.statSync(full).size : 0;
  console.log(`${exists ? "OK" : "MISSING"} ${f} (${size}b)`);
  if (exists) ok++; else missing++;
}
console.log(`\n${ok} present, ${missing} missing`);
