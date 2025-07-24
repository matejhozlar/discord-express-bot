import fs from "fs";
import path from "path";
import glob from "fast-glob";

const SOURCE_DIR = path.resolve(".");

/**
 * Extract all env variables usages from a file.
 */
function findEnvVarsInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const matches = content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Generates a .env.example file based on all env var references.
 */
export function generateEnvExampleFile(outputPath = ".env.example") {
  const allFiles = glob.sync(["**/*.js"], {
    cwd: SOURCE_DIR,
    ignore: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "client/**",
      "template/**",
      "**/.next/**",
    ],
    absolute: true,
  });

  const envVars = new Set();

  for (const file of allFiles) {
    try {
      const vars = findEnvVarsInFile(file);
      vars.forEach((v) => envVars.add(v));
    } catch (err) {
      console.warn(`Skipping file ${file}: ${err.message}`);
    }
  }

  const sortedVars = Array.from(envVars).sort();
  const envContent = sortedVars.map((v) => `${v}=`).join("\n") + "\n";

  fs.writeFileSync(outputPath, envContent);

  console.log(`✅ Wrote ${sortedVars.length} env vars to ${outputPath}`);
}
