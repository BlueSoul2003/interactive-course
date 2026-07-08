const assert = require("assert");
const path = require("path");
const { spawnSync } = require("child_process");

const scriptPath = path.resolve(__dirname, "ocr_workbooks.js");
const commonArgs = [
  scriptPath,
  "--raw",
  "_drafts/kssr_english_workbooks/does-not-exist.json",
  "--source-pdf",
  "hardcopy/KSSR_Syllabus/Primary3/English/source_pdfs/english_p3_workbook.pdf",
  "--out",
  "_drafts/kssr_english_workbooks/does-not-exist.json",
  "--pages",
  "1",
  "--dpi",
  "150",
  "--lang",
  "eng",
];

function runWithEnv(extraEnv) {
  return spawnSync(process.execPath, commonArgs, {
    cwd: path.resolve(__dirname, "..", ".."),
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
  });
}

function assertFailureIncludes(label, extraEnv, expectedText) {
  const result = runWithEnv(extraEnv);
  assert.notStrictEqual(result.status, 0, `${label} should fail before reading raw JSON`);
  const output = `${result.stdout}\n${result.stderr}`;
  assert(
    output.includes(expectedText),
    `${label} should include ${expectedText} in output:\n${output}`,
  );
}

assertFailureIncludes("POPPLER_BIN override", { POPPLER_BIN: "C:\\tmp\\missing-poppler" }, "C:\\tmp\\missing-poppler");
assertFailureIncludes(
  "TESSERACT_JS_PATH override",
  { TESSERACT_JS_PATH: "C:\\tmp\\missing-tesseract\\index.js" },
  "C:\\tmp\\missing-tesseract\\index.js",
);
assertFailureIncludes("OCR_CACHE_DIR override", { OCR_CACHE_DIR: "C:\\tmp\\missing-ocr-cache" }, "C:\\tmp\\missing-ocr-cache");

console.log("ocr_workbooks env override tests passed");
