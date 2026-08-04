// One-off helper: creates placeholder SVG thumbnails + minimal valid PDFs for
// every entry in src/data/products.json that doesn't already have a real
// file in public/images or public/pdfs. Real assets should simply overwrite
// these — see README.md.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const products = JSON.parse(
  readFileSync(path.join(rootDir, "src/data/products.json"), "utf8"),
);

const imagesDir = path.join(rootDir, "public/images");
const pdfsDir = path.join(rootDir, "public/pdfs");
mkdirSync(imagesDir, { recursive: true });
mkdirSync(pdfsDir, { recursive: true });

const palette = [
  ["#a6512c", "#e8c9a8"],
  ["#3f4a3d", "#c8d3bf"],
  ["#5c4a72", "#d8c9e6"],
  ["#7a3b3b", "#f0c9b8"],
  ["#2d4a5c", "#bcd8e6"],
  ["#8a6d1f", "#f0dfa8"],
];

function hashIndex(str, mod) {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  return h % mod;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function makeSvg(name, category) {
  const [c1, c2] = palette[hashIndex(name, palette.length)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <text x="400" y="380" font-family="Georgia, serif" font-size="42" fill="#ffffff" text-anchor="middle">${escapeXml(name)}</text>
  <text x="400" y="430" font-family="sans-serif" font-size="20" letter-spacing="3" fill="#ffffffcc" text-anchor="middle">${escapeXml(category.toUpperCase())}</text>
  <text x="400" y="760" font-family="sans-serif" font-size="16" fill="#ffffff99" text-anchor="middle">PLACEHOLDER IMAGE — REPLACE IN /public/images</text>
</svg>`;
}

function asciiSafe(str) {
  return str.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
}

function escapePdfText(str) {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function makePlaceholderPdf(name, category, description) {
  const lines = [
    "Shailesh Rajput Studio",
    "",
    `Catalogue: ${asciiSafe(name) || name}`,
    `Category: ${category}`,
    "",
    ...wrapText(description, 70),
    "",
    "[Placeholder PDF - replace this file with the real product",
    "catalogue at public/pdfs/<slug>.pdf]",
  ];

  let contentStream = "BT /F1 18 Tf 72 720 Td\n";
  let first = true;
  for (const line of lines) {
    if (!first) contentStream += "0 -26 Td\n";
    first = false;
    contentStream += `(${escapePdfText(line)}) Tj\n`;
  }
  contentStream += "ET";

  const objects = {};
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[5] = `<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf, "utf8");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function wrapText(text, width) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

for (const product of products) {
  const imagePath = path.join(rootDir, "public", product.image);
  const pdfPath = path.join(rootDir, "public", product.pdf);

  if (!existsSync(imagePath)) {
    writeFileSync(imagePath, makeSvg(product.name, product.category));
    console.log("created", product.image);
  }
  if (!existsSync(pdfPath)) {
    writeFileSync(
      pdfPath,
      makePlaceholderPdf(product.name, product.category, product.shortDescription),
    );
    console.log("created", product.pdf);
  }
}

console.log("Done. Replace any placeholder file by dropping a real one at the same path.");
