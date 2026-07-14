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
      const size = stat.size;
      if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
        console.log(`Copied: ${entry} (${size}b) -> ${d}`);
      }
    }
  }
  return count;
}

console.log("Starting copy from:", SRC);
console.log("To:", DST);

if (!fs.existsSync(SRC)) {
  console.log("ERROR: Source does not exist:", SRC);
  process.exit(1);
}

const total = copyDir(SRC, DST);
console.log("\nTotal files copied:", total);

// Verify key files at destination
const keyFiles = [
  "src/pages/Admin.tsx",
  "src/components/admin/AdminSidebar.tsx",
  "src/components/admin/panels/AdminDashboard.tsx",
  "src/convex/settings.ts",
  "src/convex/categories.ts",
  "src/convex/products.ts",
];
console.log("\nVerification at destination:");
for (const f of keyFiles) {
  const fp = path.join("/home/project", f);
  const ex = fs.existsSync(fp);
  console.log(`${ex ? "OK" : "MISSING"} ${f}`);
}
