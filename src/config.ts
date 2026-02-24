import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppConfig } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export const appConfig: AppConfig = {
    projectRoot,
    corpusPath: path.join(projectRoot, "sample-codebase"),
    includeExtensions: [".ts", ".md"],
    excludeFolders: ["node_modules", "dist", ".git", ".rag"],
    defaultTopK: 5,
};
