import "dotenv/config";
import { buildIndex, runEvaluation } from "./rag.js";

async function main() {
    await buildIndex(false);
    const report = await runEvaluation();
    console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
