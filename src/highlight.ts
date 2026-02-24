import { highlightBlock } from "tree-sitter-ts-highlight";

const THEME_CLASS = "hlts-github-dark";

function applyThemeClass(html: string): string {
    return html.replace(/<pre class="([^"]*)">/, (_match, classes: string) => {
        if (classes.includes(THEME_CLASS)) {
            return `<pre class="${classes}">`;
        }
        return `<pre class="${classes} ${THEME_CLASS}">`;
    });
}

export function highlightJson(value: unknown): string {
    const html = highlightBlock(JSON.stringify(value, null, 2), "json", {
        lineNumbers: true,
    });
    return applyThemeClass(html);
}

export function highlightTypescript(source: string): string {
    const html = highlightBlock(source, "typescript", {
        lineNumbers: true,
    });
    return applyThemeClass(html);
}
