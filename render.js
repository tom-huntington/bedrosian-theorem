import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import MarkdownIt from "markdown-it";
import katexModule from "@vscode/markdown-it-katex";

const require = createRequire(import.meta.url);
const katex = katexModule.default ?? katexModule;
const md = new MarkdownIt().use(katex);

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  console.error("Usage: node render.js <input.md> [output.html]");
  process.exit(1);
}

const input = fs.readFileSync(inputPath, "utf8");
const body = md.render(input);
const title = getTitle(input) ?? "Bedrosian theorem";
const html = renderDocument({ title, body });

if (outputPath) {
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  copyKatexAssets(outputDir);
  fs.writeFileSync(outputPath, html);
} else {
  process.stdout.write(html);
}

function getTitle(markdown) {
  return markdown.match(/^#\s+(.+)$/m)?.[1];
}

function copyKatexAssets(outputDir) {
  const katexDist = path.dirname(require.resolve("katex/dist/katex.min.css"));

  fs.copyFileSync(
    path.join(katexDist, "katex.min.css"),
    path.join(outputDir, "katex.min.css"),
  );
  fs.cpSync(path.join(katexDist, "fonts"), path.join(outputDir, "fonts"), {
    recursive: true,
  });
}

function renderDocument({ title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="./katex.min.css">
  <style>
    :root {
      color-scheme: light dark;
      --background: #faf9f6;
      --foreground: #24211d;
      --muted: #625d55;
      --link: #0b5cad;
      --rule: #ded8cf;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --background: #161615;
        --foreground: #e9e3d9;
        --muted: #b9b0a3;
        --link: #8fc3ff;
        --rule: #3d3934;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--background);
      color: var(--foreground);
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 1.08rem;
      line-height: 1.65;
    }

    main {
      width: min(100% - 2rem, 60ch);
      margin: 0 auto;
      padding: 3rem 0 4rem;
    }

    h1,
    h2,
    h3 {
      line-height: 1.2;
    }

    h1 {
      font-size: 2.4rem;
      margin: 0 0 2rem;
    }

    h2 {
      border-top: 1px solid var(--rule);
      margin-top: 2.5rem;
      padding-top: 1.4rem;
    }

    a {
      color: var(--link);
    }

    blockquote {
      border-left: 3px solid var(--rule);
      color: var(--muted);
      margin-left: 0;
      padding-left: 1rem;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 1.5rem auto;
    }

    pre,
    code {
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      font-size: 0.95em;
    }

    pre {
      overflow-x: auto;
    }

    .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.25rem 0;
    }
  </style>
</head>
<body>
  <main>
${body.trimEnd()}
  </main>
</body>
</html>
`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
