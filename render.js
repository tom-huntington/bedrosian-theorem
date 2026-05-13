// render.mjs
import fs from "fs";
import MarkdownIt from "markdown-it";
import katexModule from "@vscode/markdown-it-katex";

const katex = katexModule.default ?? katexModule;
const md = new MarkdownIt().use(katex);

const input = fs.readFileSync(process.argv[2], "utf8");

console.log(md.render(input));
