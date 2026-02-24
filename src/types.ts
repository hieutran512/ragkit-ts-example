export type AppConfig = {
    projectRoot: string;
    corpusPath: string;
    includeExtensions: string[];
    excludeFolders: string[];
    defaultTopK: number;
};

export type QaCase = {
    id: string;
    question: string;
    expectedFile: string;
    expectedKeywords: string[];
    minKeywordRecall?: number;
};

export type AskRequest = {
    question: string;
    topK?: number;
};

export type EvalResult = {
    id: string;
    question: string;
    expectedFile: string;
    topMatchFiles: string[];
    retrievalHit: boolean;
    keywordRecall: number;
    passed: boolean;
};
