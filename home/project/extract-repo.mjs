import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

const REPO_ZIP = "/tmp/repo.zip";
const EXTRACT_DIR = "/tmp/repo_extracted";
const PROJECT_ROOT = "/home/project";

// Extract the main repo archive
console.log("Extracting repo.zip...");
const repoZip = new AdmZip(REPO_ZIP);
repoZip.extractAllTo(EXTRACT_DIR, true);

// Find the extracted folder (it will be named mbcrunchy-main or similar)
const extracted = fs.readdirSync(EXTRACT_DIR);
console.log("Extracted:", extracted);

// Find project.zip inside
function findZip(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      const found = findZip(full);
      if (found) return found;
    } else if (entry === "project.zip") {
      return full;
    }
  }
  return null;
}

const projectZipPath = findZip(EXTRACT_DIR);
console.log("project.zip found at:", projectZipPath);

if (projectZipPath) {
  console.log("Extracting project.zip into project root...");
  const projectZip = new AdmZip(projectZipPath);
  
  // List contents of project.zip
  const entries = projectZip.getEntries();
  console.log(`project.zip contains ${entries.length} entries`);
  
  // Extract all to project root
  projectZip.extractAllTo(PROJECT_ROOT, true);
  
  // Verify some key files
  const checkFiles = [
    "package.json",
    "src/main.tsx",
    "src/convex/schema.ts",
    "src/pages/Admin.tsx",
    "src/pages/Landing.tsx",
  ];
  
  console.log("\nVerifying extracted files:");
  for (const f of checkFiles) {
    const full = path.join(PROJECT_ROOT, f);
    const exists = fs.existsSync(full);
    const size = exists ? fs.statSync(full).size : 0;
    console.log(`${exists ? "OK" : "MISSING"} ${f} (${size}b)`);
  }
  
  // List all top-level files in project root
  console.log("\nProject root contents:");
  fs.readdirSync(PROJECT_ROOT).forEach(f => {
    const stat = fs.statSync(path.join(PROJECT_ROOT, f));
    console.log(`  ${f}${stat.isDirectory() ? "/" : ""} (${stat.size || ""})`);
  });
  
  console.log("\nRecovery complete!");
} else {
  console.log("ERROR: project.zip not found in extracted repo!");
  console.log("Listing extracted structure:");
  function listDir(dir, depth = 0) {
    if (depth > 3) return;
    try {
      const entries = fs.readdirSync(dir);
      for (const e of entries) {
        if (e.startsWith(".")) continue;
        const full = path.join(dir, e);
        const stat = fs.statSync(full);
        console.log("  ".repeat(depth) + e + (stat.isDirectory() ? "/" : ""));
        if (stat.isDirectory()) listDir(full, depth + 1);
      }
    } catch (er) {}
  }
  listDir(EXTRACT_DIR);
}
