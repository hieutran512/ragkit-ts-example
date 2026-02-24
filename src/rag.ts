import path from "node:path";
import { promises as fs } from "node:fs";
import {
    CodebaseIndexer,
    CodebaseSearcher,
    createOllamaEmbed,
    createOpenAICompatibleEmbed,
    type EmbedFunction,
} from "ragkit-ts";
import { appConfig } from "./config.js";
import type { EvalResult, QaCase } from "./types.js";

function createEmbedFromEnv(): EmbedFunction {
    const openaiBaseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL;
    const openaiModel = process.env.OPENAI_COMPATIBLE_MODEL;
    if (openaiBaseUrl) {
        return createOpenAICompatibleEmbed({
            baseUrl: openaiBaseUrl,
            model: openaiModel,
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    return createOllamaEmbed({
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: process.env.OLLAMA_MODEL ?? "nomic-embed-text",
    });
}

const embed = createEmbedFromEnv();
const indexer = new CodebaseIndexer({ embed });
const searcher = new CodebaseSearcher({ embed, indexer });

export async function buildIndex(force = false): Promise<void> {
    if (force) {
        await indexer.clearFolder(appConfig.corpusPath);
    }

    await indexer.index(appConfig.corpusPath, {
        includeExtensions: appConfig.includeExtensions,
        excludeFolders: appConfig.excludeFolders,
        concurrency: 2,
        embedBatchSize: 16,
    });
}

export async function askQuestion(question: string, topK = appConfig.defaultTopK) {
    const result = await searcher.search(appConfig.corpusPath, question, { topK });
    const answer = synthesizeAnswer(question, result.matches.map((item) => item.content));
    return {
        question,
        answer,
        matches: result.matches.map((match) => ({
            filePath: path.relative(appConfig.projectRoot, match.filePath),
            score: Number(match.score.toFixed(4)),
            content: match.content,
        })),
        durationMs: result.durationMs,
    };
}

function synthesizeAnswer(question: string, chunks: string[]): string {
    if (!chunks.length) {
        return "No relevant context was retrieved.";
    }

    const keywords = question
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2);

    const bestChunk = [...chunks]
        .sort((left, right) => scoreChunk(right, keywords) - scoreChunk(left, keywords))[0]
        .trim();

    const lines = bestChunk
        .split("\n")
        .map((line) => line.replace(/\r$/, ""))
        .filter((line) => line.trim().length > 0)
        .slice(0, 6);

    return lines.join("\n");
}

function scoreChunk(chunk: string, keywords: string[]): number {
    const lowered = chunk.toLowerCase();
    return keywords.reduce((score, keyword) => {
        return lowered.includes(keyword) ? score + 1 : score;
    }, 0);
}

export async function runEvaluation(topK = appConfig.defaultTopK) {
    const qaPath = path.join(appConfig.projectRoot, "data", "qa-set.json");
    const qaRaw = await fs.readFile(qaPath, "utf-8");
    const qaSet = JSON.parse(qaRaw) as QaCase[];

    const perQuestion: EvalResult[] = [];

    for (const qaCase of qaSet) {
        const response = await askQuestion(qaCase.question, topK);
        const topMatchFiles = response.matches.map((m) => m.filePath);
        const retrievalHit = topMatchFiles.some((file) => file.endsWith(qaCase.expectedFile));

        const joinedContext = response.matches.map((m) => m.content.toLowerCase()).join("\n");
        const matchedKeywordCount = qaCase.expectedKeywords.filter((kw) =>
            joinedContext.includes(kw.toLowerCase()),
        ).length;
        const keywordRecall = qaCase.expectedKeywords.length
            ? matchedKeywordCount / qaCase.expectedKeywords.length
            : 0;

        const threshold = qaCase.minKeywordRecall ?? 0.6;
        perQuestion.push({
            id: qaCase.id,
            question: qaCase.question,
            expectedFile: qaCase.expectedFile,
            topMatchFiles,
            retrievalHit,
            keywordRecall: Number(keywordRecall.toFixed(2)),
            passed: retrievalHit && keywordRecall >= threshold,
        });
    }

    const total = perQuestion.length;
    const retrievalHitRate = perQuestion.filter((r) => r.retrievalHit).length / total;
    const averageKeywordRecall = perQuestion.reduce((acc, result) => acc + result.keywordRecall, 0) / total;
    const passRate = perQuestion.filter((result) => result.passed).length / total;

    return {
        corpusPath: path.relative(appConfig.projectRoot, appConfig.corpusPath),
        total,
        retrievalHitRate: Number(retrievalHitRate.toFixed(2)),
        averageKeywordRecall: Number(averageKeywordRecall.toFixed(2)),
        passRate: Number(passRate.toFixed(2)),
        perQuestion,
    };
}
