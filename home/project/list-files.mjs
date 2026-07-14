import fs from "fs";
import path from "path";

function walk(dir) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (!entry.startsWith(".") && entry !== "node_modules" && entry !== "_generated") {
          results = results.concat(walk(full));
        }
      } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
        results.push(full);
      }
    }
  } catch (e) {}
  return results;
}

const files = walk(".");
files.sort();
console.log("Total TS/TSX files:", files.length);
console.log("---");
files.forEach(f => console.log(f));
