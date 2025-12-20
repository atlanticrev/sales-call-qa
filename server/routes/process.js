import crypto from "crypto";
import { ProgressReporter } from "../infra/progress-reporter.ts";
import { processStore } from "../infra/process-store.js";
import { runProcess } from "../pipelines/run-process.js";

export default async function processRoute(app) {
  app.post("/start", async (req, reply) => {
    const jobId = crypto.randomUUID();

    const progress = new ProgressReporter(req.log);

    const file = await req.file();
    if (!file) {
      return reply.code(400).send({ errors: { file: "audio required" } });
    }

    const prompt = file.fields?.prompt?.value;
    if (!prompt || typeof prompt !== "string") {
      return reply.code(400).send({ errors: { prompt: "prompt required" } });
    }

    const buffer = await file.toBuffer();

    processStore.set(jobId, {
      progress,
      pdf: null,
    });

    progress.report({
      stage: "upload",
      message: "File received",
      meta: { filename: file.filename },
    });

    runProcess({
      jobId,
      buffer,
      filename: file.filename,
      prompt,
      progress,
      store: processStore,
    });

    return reply.send({ jobId });
  });

  app.get("/stream", async (req, reply) => {
    const { jobId } = req.query;

    const entry = processStore.get(jobId);
    if (!entry) {
      return reply.code(404).send({ error: "Job not found" });
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const send = (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    entry.progress.on("progress", send);

    req.raw.on("close", () => {
      entry.progress.off("progress", send);
    });
  });

  app.get("/result", async (req, reply) => {
    const { jobId } = req.query;

    const entry = processStore.get(jobId);
    if (!entry || !entry.pdf) {
      return reply.code(404).send({ error: "PDF not ready" });
    }

    reply
      .header("Content-Type", "application/pdf")
      .header(
        "Content-Disposition",
        `attachment; filename="report-${jobId}.pdf"`
      )
      .send(entry.pdf);
  });
}
