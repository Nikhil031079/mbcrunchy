import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      } else if (entry.endsWith(".ts") || entry.endsWith(".tsx") || entry.endsWith(".d.ts") || entry.endsWith(".svg")) {
        files.push(full);
      }
    }
  } catch (e) {}
  return files;
}

console.log("=== Written files ===");
const allFiles = walk(path.join(__dirname, "src"));
allFiles.sort();
allFiles.forEach(f => console.log(f));
console.log("\nTotal:", allFiles.length);

const keyFiles = [
  "src/convex/adminAuth.ts",
  "src/convex/settings.ts",
  "src/convex/categories.ts",
  "src/convex/products.ts",
  "src/convex/dashboard.ts",
  "src/convex/migration.ts",
  "src/convex/schema.ts",
  "src/pages/Admin.tsx",
  "src/pages/Landing.tsx",
  "src/main.tsx",
  "src/components/admin/AdminSidebar.tsx",
  "src/components/admin/panels/AdminDashboard.tsx",
  "src/components/admin/panels/AdminProducts.tsx",
  "src/components/admin/panels/AdminCategories.tsx",
  "src/components/admin/panels/AdminBranding.tsx",
  "src/components/admin/panels/AdminSettings.tsx",
  "src/components/admin/panels/AdminAccountSecurity.tsx",
  "src/components/admin/panels/AdminMigration.tsx",
  "src/components/admin/panels/AdminOrders.tsx",
  "src/components/admin/panels/AdminReviews.tsx",
  "src/components/admin/panels/AdminCoupons.tsx",
  "src/components/admin/panels/AdminOffers.tsx",
  "src/components/admin/panels/AdminCombos.tsx",
  "src/components/admin/panels/AdminPartyPacks.tsx",
  "src/components/admin/panels/AdminCustomers.tsx",
  "src/components/admin/panels/AdminInventory.tsx",
  "src/components/admin/panels/AdminAnalytics.tsx",
  "src/lib/weightUnits.ts",
  "src/vite-env.d.ts",
  "src/assets/logo.svg",
];

console.log("\n=== Key file check ===");
let ok = 0, missing = 0;
keyFiles.forEach(f => {
  const exists = fs.existsSync(path.join(__dirname, f));
  const size = exists ? fs.statSync(path.join(__dirname, f)).size : 0;
  console.log(`${exists ? "OK" : "MISSING"} ${f} (${size}b)`);
  if (exists) ok++; else missing++;
});
console.log(`\n${ok} present, ${missing} missing`);
