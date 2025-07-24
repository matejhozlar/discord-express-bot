import path from "path";
import { generateEnvExampleFile } from "./src/generateExampleEnvFile.js";

const outputPath = path.resolve(".env.example");
generateEnvExampleFile(outputPath);
