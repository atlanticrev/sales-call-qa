import { chromium } from "playwright";
import { renderReport } from "../templates/report.template.js";

/**
 * @param report
 * @param segments
 * @param progress ProgressReporter
 */
export async function generatePdf(report, segments, progress) {
  progress.report({
    stage: "pdf",
    message: "Rendering HTML for PDF",
  });

  const html = renderReport(report, segments);

  progress.report({
    stage: "pdf",
    level: "debug",
    message: "Launching Chromium",
  });

  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    progress.report({
      stage: "pdf",
      level: "debug",
      message: "Setting HTML content",
    });

    await page.setContent(html, { waitUntil: "load" });

    progress.report({
      stage: "pdf",
      message: "Generating PDF document",
    });

    const pdf = await page.pdf({ format: "A4" });

    progress.report({
      stage: "pdf",
      message: "PDF generation completed",
    });

    return pdf;
  } finally {
    progress.report({
      stage: "pdf",
      level: "debug",
      message: "Closing Chromium",
    });

    await browser.close();
  }
}
