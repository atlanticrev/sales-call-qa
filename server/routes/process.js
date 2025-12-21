import crypto from "crypto";
import { ProgressReporter } from "../infra/progress-reporter.js";
import { runProcess } from "../pipelines/run-process.js";
import { progressStore } from '../infra/progress-store.js';

export default async function processRoute(app) {
  app.post("/start", async (req, reply) => {
    if (!req.isMultipart()) {
      return reply.code(400).send({ error: "multipart expected" });
    }

    const jobId = crypto.randomUUID();

    progressStore.set(jobId, {
      events: [],
      listeners: new Set(),
      pdf: null,
    });

    const progress = new ProgressReporter(jobId, req.log);

    const file = req.body.file;
    if (!file) {
      return reply.code(400).send({ errors: { file: "File is required" } });
    }

    const prompt = req.body?.prompt?.value;
    if (!prompt || typeof prompt !== "string") {
      return reply.code(400).send({ errors: { prompt: "Prompt is required" } });
    }

    const buffer = await file.toBuffer();

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
      store: progressStore,
    });

    return reply.send({ jobId });
  });

  app.get("/stream", async (req, reply) => {
    const { jobId } = req.query;

    if (!progressStore.has(jobId)) {
      return reply.code(404).send('Unknown job');
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // @todo Replace '*'
      'Access-Control-Allow-Origin': '*',
    });

    const sendSSEMessage = (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const reporter = new ProgressReporter(jobId, req.log);

    const unsubscribe = reporter.subscribe(sendSSEMessage);

    req.raw.on('close', () => {
      unsubscribe();

      reply.raw.end();
    });
  });

  app.get("/result", async (req, reply) => {
    const { jobId } = req.query;

    const entry = progressStore.get(jobId);
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
