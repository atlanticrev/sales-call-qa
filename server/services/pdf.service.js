import { chromium } from "playwright";
import { renderReport } from "../templates/report.template.js";

export async function generatePdf(report, segments) {
  console.log("▶ generating PDF (starting)...");

  const html = renderReport(report, segments);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });

  const pdf = await page.pdf({ format: "A4" });
  await browser.close();

  console.log("▶ generating PDF (ending)...");

  return pdf;
}
