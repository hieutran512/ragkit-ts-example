import "dotenv/config";
import express from "express";
import path from "node:path";
import { appConfig } from "./config.js";
import { highlightJson, highlightTypescript } from "./highlight.js";
import { askQuestion, buildIndex, runEvaluation } from "./rag.js";
import type { AskRequest } from "./types.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(
    "/vendor/tree-sitter-ts-highlight",
    express.static(path.join(appConfig.projectRoot, "node_modules", "tree-sitter-ts-highlight")),
);
app.use(express.static(path.join(appConfig.projectRoot, "public")));

app.get("/api/health", async (_req, res) => {
    res.json({ ok: true });
});

app.post("/api/index", async (req, res) => {
    try {
        const force = Boolean(req.body?.force);
        await buildIndex(force);
        res.json({ ok: true, force });
    } catch (error) {
        res.status(500).json({ ok: false, error: toErrorMessage(error) });
    }
});

app.post("/api/ask", async (req, res) => {
    try {
        const body = req.body as AskRequest;
        if (!body?.question?.trim()) {
            res.status(400).json({ ok: false, error: "question is required" });
            return;
        }

        const response = await askQuestion(body.question.trim(), body.topK);
        res.json({
            ok: true,
            ...response,
            answerHighlighted: highlightTypescript(response.answer),
            matchesHighlighted: highlightJson(response.matches),
        });
    } catch (error) {
        res.status(500).json({ ok: false, error: toErrorMessage(error) });
    }
});

app.get("/api/eval", async (req, res) => {
    try {
        const topK = req.query.topK ? Number(req.query.topK) : undefined;
        const report = await runEvaluation(topK);
        res.json({
            ok: true,
            ...report,
            evalHighlighted: highlightJson(report),
        });
    } catch (error) {
        res.status(500).json({ ok: false, error: toErrorMessage(error) });
    }
});

app.listen(port, () => {
    console.log(`RAG app running on http://localhost:${port}`);
});

function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return "Unknown error";
}
