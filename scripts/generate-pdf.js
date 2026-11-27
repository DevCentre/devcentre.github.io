const fs = require("node:fs/promises");
const path = require("node:path");
const puppeteer = require("puppeteer");

const OUTPUT_DIR = process.cwd();
const PAGES = [
  { input: "index.html", output: "FelipePena-CV.pdf" },
  { input: "index_pt.html", output: "FelipePena-CV_PT.pdf" },
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
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
  });
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : error;
    process.stderr.write(`Bundled Chrome unavailable (${reason}). Using system Chrome.\n`);
    browser = await puppeteer.launch({ headless: true, channel: "chrome" });
  }

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
