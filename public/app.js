const indexBtn = document.getElementById("indexBtn");
const evalBtn = document.getElementById("evalBtn");
const askBtn = document.getElementById("askBtn");
const statusEl = document.getElementById("status");
const answerEl = document.getElementById("answer");
const matchesEl = document.getElementById("matches");
const questionEl = document.getElementById("question");

function setStatus(value) {
    statusEl.textContent = value;
}

function setHighlighted(element, highlightedHtml, fallbackText) {
    if (highlightedHtml) {
        element.innerHTML = highlightedHtml;
        return;
    }

    element.textContent = fallbackText;
}

indexBtn.addEventListener("click", async () => {
    setStatus("Building index...");
    const response = await fetch("/api/index", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force: false }),
    });
    const data = await response.json();
    setStatus(JSON.stringify(data, null, 2));
});

evalBtn.addEventListener("click", async () => {
    setStatus("Running evaluation...");
    const response = await fetch("/api/eval");
    const data = await response.json();
    if (!data.ok) {
        setStatus(data.error ?? "Evaluation failed");
        return;
    }

    setHighlighted(statusEl, data.evalHighlighted, JSON.stringify(data, null, 2));
});

askBtn.addEventListener("click", async () => {
    const question = questionEl.value.trim();
    if (!question) {
        setStatus("Question is required");
        return;
    }

    setStatus("Searching...");
    const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, topK: 5 }),
    });
    const data = await response.json();

    if (!data.ok) {
        setStatus(data.error ?? "Request failed");
        return;
    }

    setStatus(`Retrieved in ${data.durationMs}ms`);
    setHighlighted(answerEl, data.answerHighlighted, data.answer);
    setHighlighted(matchesEl, data.matchesHighlighted, JSON.stringify(data.matches, null, 2));
});
