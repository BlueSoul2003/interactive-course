const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const POPPLER_BIN =
  process.env.POPPLER_BIN ||
  "C:\\Users\\hong0\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\poppler\\Library\\bin";
const PDFTOPPM_PATH = path.join(POPPLER_BIN, "pdftoppm.exe");
const PDFINFO_PATH = path.join(POPPLER_BIN, "pdfinfo.exe");
const TESSERACT_JS_PATH =
  process.env.TESSERACT_JS_PATH ||
  "C:\\Users\\hong0\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\.pnpm\\tesseract.js@7.0.0\\node_modules\\tesseract.js";
const OCR_CACHE_DIR = process.env.OCR_CACHE_DIR
  ? path.resolve(process.env.OCR_CACHE_DIR)
  : path.join(REPO_ROOT, "_drafts", "kssr_english_workbooks", "ocr_cache");

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }
  return args;
}

function usage() {
  console.error(
    [
      "Usage:",
      "node tools/workbook_pipeline/ocr_workbooks.js --raw <raw_pages.json> --source-pdf <pdf> --out <raw_pages.json> --pages all|1-3|1 --dpi 150 --lang eng [--force]",
    ].join("\n"),
  );
}

function assertRequired(args, key) {
  if (!args[key]) {
    throw new Error(`Missing required argument --${key}`);
  }
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

function writeJson(jsonPath, payload) {
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function normalizeText(text) {
  return (text || "").replace(/\r\n/g, "\n").trim();
}

function parsePageSelection(selection, totalPages) {
  if (selection === "all") {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const singlePageMatch = /^\d+$/.exec(selection);
  if (singlePageMatch) {
    const page = Number(selection);
    validatePageInRange(page, totalPages);
    return [page];
  }

  const rangeMatch = /^(\d+)-(\d+)$/.exec(selection);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (end < start) {
      throw new Error(`Invalid page range: ${selection}`);
    }
    validatePageInRange(start, totalPages);
    validatePageInRange(end, totalPages);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  throw new Error(`Unsupported --pages value: ${selection}`);
}

function validatePageInRange(page, totalPages) {
  if (page < 1 || page > totalPages) {
    throw new Error(`Page ${page} is outside 1-${totalPages}`);
  }
}

function ensureFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function getPdfPageCount(pdfPath) {
  const result = spawnSync(PDFINFO_PATH, [pdfPath], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`pdfinfo failed: ${result.stderr || result.stdout}`.trim());
  }

  const match = /^Pages:\s+(\d+)$/m.exec(result.stdout);
  if (!match) {
    throw new Error("Unable to parse page count from pdfinfo output");
  }
  return Number(match[1]);
}

function renderPageToPng(pdfPath, pageNumber, dpi, tempDir) {
  const prefix = path.join(tempDir, `page-${String(pageNumber).padStart(3, "0")}`);
  const renderArgs = [
    "-f",
    String(pageNumber),
    "-l",
    String(pageNumber),
    "-r",
    String(dpi),
    "-png",
    pdfPath,
    prefix,
  ];
  const result = spawnSync(PDFTOPPM_PATH, renderArgs, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`pdftoppm failed for page ${pageNumber}: ${result.stderr || result.stdout}`.trim());
  }

  const pngPath = `${prefix}-${String(pageNumber).padStart(2, "0")}.png`;
  ensureFileExists(pngPath, `Rendered page PNG for page ${pageNumber}`);
  return pngPath;
}

function createAudit(bookId, rawPath, sourcePdf, pages, lang) {
  const totalEmbedded = pages.reduce((sum, page) => sum + Number(page.embeddedTextChars || 0), 0);
  const totalOcr = pages.reduce((sum, page) => sum + Number(page.ocrTextChars || 0), 0);
  const ocrPages = pages.filter((page) => Number(page.ocrTextChars || 0) > 0);
  const imageOnlyPages = pages.filter(
    (page) => Number(page.embeddedTextChars || 0) === 0 && Number(page.ocrTextChars || 0) === 0,
  );

  const lines = [
    `# ${bookId} Extraction Audit`,
    "",
    `- Source PDF: \`${sourcePdf.replace(/\\/g, "/")}\``,
    `- Raw pages file: \`${rawPath.replace(/\\/g, "/")}\``,
    `- Detected pages: ${pages.length}`,
    `- Embedded text characters: ${totalEmbedded}`,
    `- OCR text characters: ${totalOcr}`,
    `- OCR pages with text: ${ocrPages.length}`,
    `- OCR language: ${lang}`,
    `- OCR cache path: \`${OCR_CACHE_DIR.replace(/\\/g, "/")}\``,
    `- Image-only or empty pages remaining: ${imageOnlyPages.length}`,
    "",
    "## Page Status",
    "",
    "| Page | Mode | Embedded chars | OCR chars |",
    "|---:|---|---:|---:|",
  ];

  for (const page of pages) {
    lines.push(`| ${page.page} | ${page.mode} | ${page.embeddedTextChars} | ${page.ocrTextChars} |`);
  }

  return `${lines.join("\n")}\n`;
}

async function createWorker(lang) {
  const { createWorker: makeWorker } = require(TESSERACT_JS_PATH);
  return makeWorker(lang, 1, {
    langPath: OCR_CACHE_DIR,
    cachePath: OCR_CACHE_DIR,
    gzip: false,
    logger: () => {},
  });
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return 0;
  }

  assertRequired(args, "raw");
  assertRequired(args, "source-pdf");
  assertRequired(args, "out");
  assertRequired(args, "pages");
  assertRequired(args, "dpi");
  assertRequired(args, "lang");

  ensureFileExists(PDFTOPPM_PATH, "pdftoppm.exe");
  ensureFileExists(PDFINFO_PATH, "pdfinfo.exe");
  ensureFileExists(TESSERACT_JS_PATH, "tesseract.js package");
  ensureFileExists(path.join(OCR_CACHE_DIR, `${args.lang}.traineddata`), `${args.lang}.traineddata`);

  const rawPath = path.resolve(REPO_ROOT, args.raw);
  const outPath = path.resolve(REPO_ROOT, args.out);
  const sourcePdfPath = path.resolve(REPO_ROOT, args["source-pdf"]);
  ensureFileExists(rawPath, "Raw pages JSON");
  ensureFileExists(sourcePdfPath, "Source PDF");

  const payload = readJson(rawPath);
  const pages = Array.isArray(payload.pages) ? payload.pages : null;
  if (!pages) {
    throw new Error(`Invalid raw pages payload in ${rawPath}`);
  }

  const pdfPageCount = getPdfPageCount(sourcePdfPath);
  if (pages.length !== pdfPageCount) {
    throw new Error(`PDF page count mismatch: raw has ${pages.length}, pdfinfo reports ${pdfPageCount}`);
  }

  const selectedPages = parsePageSelection(String(args.pages), pages.length);
  const dpi = Number(args.dpi);
  if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new Error(`Invalid --dpi value: ${args.dpi}`);
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ocr-workbooks-"));
  const startedAt = Date.now();
  let processedCount = 0;
  let skippedCount = 0;
  const worker = await createWorker(String(args.lang));

  try {
    for (const pageNumber of selectedPages) {
      const page = pages[pageNumber - 1];
      if (!args.force && Number(page.ocrTextChars || 0) > 0) {
        skippedCount += 1;
        continue;
      }

      const pngPath = renderPageToPng(sourcePdfPath, pageNumber, dpi, tempDir);
      try {
        const recognition = await worker.recognize(pngPath);
        const ocrText = normalizeText(recognition?.data?.text || "");
        page.ocrText = ocrText;
        page.ocrTextChars = ocrText.length;
        page.mode = ocrText.length > 0 ? "ocr_text" : "image_only_or_empty";
        processedCount += 1;
        writeJson(outPath, payload);
      } finally {
        if (fs.existsSync(pngPath)) {
          fs.unlinkSync(pngPath);
        }
      }
    }
  } finally {
    await worker.terminate();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  writeJson(outPath, payload);
  const auditPath = path.join(path.dirname(outPath), "extraction_audit.md");
  fs.writeFileSync(
    auditPath,
    createAudit(String(payload.bookId || path.basename(path.dirname(outPath))), outPath, args["source-pdf"], pages, String(args.lang)),
    "utf8",
  );

  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  const totalOcrChars = pages.reduce((sum, page) => sum + Number(page.ocrTextChars || 0), 0);
  console.log(
    JSON.stringify(
      {
        processedPages: processedCount,
        skippedPages: skippedCount,
        selectedPages: selectedPages.length,
        totalPages: pages.length,
        totalOcrChars,
        elapsedSeconds: Number(elapsedSeconds),
        outPath,
        auditPath,
      },
      null,
      2,
    ),
  );
  return 0;
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
