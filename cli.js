#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const targetDir = process.argv[2] || "discord-express-bot";
  const src = path.join(__dirname, "template");
  const dest = path.resolve(process.cwd(), targetDir);

  await fs.mkdir(dest, { recursive: true });

  await fs.cp(src, dest, { recursive: true });

  const gi = path.join(dest, "gitignore");
  try {
    await fs.rename(path.join(dest, ".gitignore"), gi);
  } catch {}

  console.log(`\n✔ Project created in ${targetDir}`);
  console.log(`\nNext steps:
  cd ${targetDir}
  npm install
  cp .env.example .env
  npm run register:commands
  npm run dev
`);
}

main().catch((err) => {
  console.error("Scaffold failed:", err);
  process.exit(1);
});
