import "dotenv/config";
import { buildIndex } from "./rag.js";

async function main() {
    const force = process.argv.includes("--force");
    await buildIndex(force);
    console.log(`Index completed (force=${force})`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
