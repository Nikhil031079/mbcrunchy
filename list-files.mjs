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

const files = walk("./src");
files.sort();
console.log("Count:", files.length);
files.forEach(f => console.log(f));
