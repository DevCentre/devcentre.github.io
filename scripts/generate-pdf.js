const fs = require("node:fs/promises");
const path = require("node:path");
const puppeteer = require("puppeteer");

const OUTPUT_DIR = process.cwd();
const PAGES = [
  { input: "index.html", output: "FelipePena-CV.pdf" },
  { input: "index_en.html", output: "FelipePena-CV_EN.pdf" },
  { input: "resume_pdf.html", output: "FelipePena-CV_ATS.pdf" },
];

async function renderPdf(page, input, output) {
  const filePath = `file://${path.join(process.cwd(), input)}`;
  await page.goto(filePath, { waitUntil: "networkidle0" });
  await page.emulateMediaType("print");
  await page.pdf({
    path: path.join(OUTPUT_DIR, output),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    for (const entry of PAGES) {
      await renderPdf(page, entry.input, entry.output);
      process.stdout.write(`Generated ${entry.output}\n`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exit(1);
});
