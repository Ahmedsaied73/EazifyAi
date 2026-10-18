#!/usr/bin/env node
// Lists every animation, transition, transform and keyframe in a CSS file, and
// (with two files) reports anything present in the original but missing in the port.
//   node audit-motion.mjs original.css            -> markdown inventory
//   node audit-motion.mjs original.css port.css   -> diff, exit 1 if anything is missing
import { readFileSync } from "node:fs";

const MOTION = /^(animation|transition|transform|translate|rotate|scale|will-change|scroll-behavior)/;
const clean = (s) => s.replace(/\s+/g, " ").trim();

function load(file) {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@(import|source|custom-variant|plugin|config|layer)\b[^;{}]*;/g, "");
}

function parse(css, ctx = "", out = []) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const head = clean(css.slice(i, open));
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    if (head.startsWith("@keyframes")) out.push({ ctx, sel: head, decl: ["frames: " + clean(body)] });
    else if (/^@(media|supports|layer)/.test(head)) parse(body, ctx + head + " >> ", out);
    else if (head.startsWith("@")) out.push({ ctx, sel: head, decl: [clean(body)] });
    else out.push({ ctx, sel: head, decl: body.split(";").map(clean).filter(Boolean) });
    i = j;
  }
  return out;
}

function motionRows(file) {
  const rows = [];
  for (const r of parse(load(file))) {
    const reduced = r.ctx.includes("prefers-reduced-motion");
    const keep = r.sel.startsWith("@keyframes") || r.sel.startsWith("@property") ? r.decl : r.decl.filter((d) => MOTION.test(d) || reduced);
    if (keep.length) rows.push({ ctx: r.ctx, sel: r.sel, decl: keep });
  }
  return rows;
}

const [a, b] = process.argv.slice(2);
if (!a) {
  console.error("usage: node audit-motion.mjs original.css [port.css]");
  process.exit(2);
}
const A = motionRows(a);
if (!b) {
  console.log("| context | selector | motion declarations |\n|---|---|---|");
  for (const r of A) console.log(`| ${r.ctx || "-"} | \`${r.sel}\` | ${r.decl.map((d) => "`" + d + "`").join("<br>")} |`);
  console.log(`\n${A.length} rows, ${A.filter((r) => r.sel.startsWith("@keyframes")).length} keyframes`);
} else {
  const key = (r, d) => r.ctx + "|" + r.sel + "|" + d;
  const have = new Set(motionRows(b).flatMap((r) => r.decl.map((d) => key(r, d))));
  const missing = A.flatMap((r) => r.decl.map((d) => key(r, d))).filter((k) => !have.has(k));
  console.log(missing.length ? "MISSING in port:\n" + missing.join("\n") : "OK: every motion rule of the original exists in the port");
  process.exit(missing.length ? 1 : 0);
}
