import path from "path";
import { generateRequiredEnvVars } from "./src/generateRequiredEnvVars.js";

const outputPath = path.resolve("config/env/vars/requiredVars.js");
generateRequiredEnvVars(outputPath);
